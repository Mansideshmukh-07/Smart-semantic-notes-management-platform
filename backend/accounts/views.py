# backend/accounts/views.py
import os
from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.parsers import MultiPartParser, FormParser
from django.conf import settings
from django.core.files.storage import default_storage
from django.db.models.expressions import RawSQL  
from sentence_transformers import SentenceTransformer
from groq import Groq  

# ── Imports for your existing components ───────────────────────────────────
from .serializers import SignupSerializer
from .models import UploadedFile, NoteChunk

# ── Imports pointing to your package folder ────────────────────────────
from .preprocessing_file.read_file import read_file
from .preprocessing_file.preprocess import preprocess
from .preprocessing_file.text_chunk import chunk

# ── NEW: Import your verified handwritten OCR pipeline ──────────────────────
from .preprocessing_file.ocr_handwritten import extract_handwritten_text

# Initialize the local embedding model once when the server boots up (384 dimensions)
embedding_model = SentenceTransformer('all-MiniLM-L6-v2')


# ── Helper function to safely instantiate Groq on-demand ───────────────────
def _get_groq_client():
    api_key = os.environ.get("GROQ_API_KEY")
    if not api_key:
        return None
    try:
        return Groq(api_key=api_key)
    except Exception:
        return None


# ── Existing Identity Views ────────────────────────────────────────────────

class SignupView(APIView):
    permission_classes = [AllowAny] 

    def post(self, request):
        serializer = SignupSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(
                {"message": "User created"},
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response({
            "id": request.user.id,
            "username": request.user.username,
            "email": request.user.email,
        })


# ── File Processing Pipeline View ──────────────────────────────────────────

class FileUploadAndProcessView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        file_obj = request.FILES.get('file')
        subject_name = request.data.get('subject', 'General').strip()
        category = request.data.get('file_type', 'digital').strip().lower() 

        if not file_obj:
            return Response({"error": "No file uploaded"}, status=status.HTTP_400_BAD_REQUEST)

        saved_path = default_storage.save(os.path.join('media', file_obj.name), file_obj)
        full_local_path = os.path.join(settings.BASE_DIR, saved_path)

        uploaded_file_record = UploadedFile.objects.create(
            user=request.user,
            filename=file_obj.name,
            subject=subject_name,
            file_type=category,
            file_path=full_local_path
        )

        raw_extracted_text = ""
        
        # ── Text Extraction Router ──────────────────────────────────────────
        if category == "digital":
            try:
                raw_extracted_text = read_file(full_local_path)
            except Exception as e:
                return Response({"error": f"Read pipeline failed: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)
                
        elif category == "handwritten":
            try:
                # 💡 Bypassed placeholder and connected your actual pipeline!
                raw_extracted_text = extract_handwritten_text(full_local_path)
            except FileNotFoundError as e:
                return Response({"error": f"Image file not found: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)
            except Exception as e:
                return Response({"error": f"Handwritten OCR pipeline failed: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)

        # ── Preprocessing, Chunking, and Embedding ─────────────────────────
        cleaned_text = preprocess(raw_extracted_text, verbose=False)

        if not cleaned_text.strip():
            return Response({"error": "No processable text extracted from this document"}, status=status.HTTP_400_BAD_REQUEST)

        text_chunks = chunk(
            cleaned_text,
            chunk_size=250,
            overlap=40,
            min_words=20,
            verbose=False
        )

        for idx, text_block in enumerate(text_chunks):
            vector_embedding = embedding_model.encode(text_block).tolist()
            
            NoteChunk.objects.create(
                file=uploaded_file_record,
                chunk_text=text_block,
                chunk_index=idx,
                embedding=vector_embedding
            )

        return Response({
            "message": "Successfully executed processing pipeline inside preprocessing_file pack!",
            "file_id": uploaded_file_record.id,
            "subject": uploaded_file_record.subject,
            "file_type": uploaded_file_record.file_type,
            "total_chunks_saved": len(text_chunks)
        }, status=status.HTTP_201_CREATED)


# ── Live Groq AI RAG Search View ───────────────────────────────────────────

class ChatQueryView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user_query = request.data.get('query', '').strip()
        
        if not user_query:
            return Response({"error": "Query text cannot be empty"}, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if Groq client initializes safely
        client = _get_groq_client()
        if not client:
            return Response(
                {"error": "Groq API service is currently unconfigured on the server environment"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
        try:
            # 1. Turn text query into vector weights array locally
            query_vector = embedding_model.encode(user_query).tolist()
            
            # 2. Ask PostgreSQL to find top 3 matches using the fast HNSW index
            matched_chunks = NoteChunk.objects.filter(
                file__user=request.user
            ).annotate(
                distance=RawSQL("embedding <=> %s::vector", [query_vector])
            ).order_by('distance')[:3] 

            if not matched_chunks:
                return Response({
                    "answer": "I searched your study library, but couldn't find any note chunks matching that topic."
                }, status=status.HTTP_200_OK)

            # 3. Pull citation tracking data from the absolute best match item
            best_match_chunk = matched_chunks[0]
            source_file_name = best_match_chunk.file.filename
            source_subject = best_match_chunk.file.subject

            # 4. Bind all 3 retrieved chunks together to build the context background
            context_text = "\n\n".join([item.chunk_text for item in matched_chunks])

            # ── SYSTEM PROMPT FOR EXACT RAW CHUNK EXTRACTION ───
            system_prompt = (
                "You are a strict text retrieval assistant. Your ONLY job is to copy and paste "
                "the exact, raw text from the provided context chunks that directly answers the student's question.\n\n"
                
                "CRITICAL INSTRUCTIONS:\n"
                "1. DO NOT paraphrase, do not reword, do not summarize, and do not fix typos. Copy the text exactly as it appears.\n"
                "2. Do not add any conversational text like 'Based on your notes...' or 'Here is the chunk...'. Start with the exact raw note text immediately.\n"
                "3. If multiple chunks contain relevant sentences, output those exact sections separated by a clean blank line space.\n"
                "4. Keep the original formatting (like bullet points or dashes) exactly as they are in the chunks.\n\n"
                
                f"--- RAW STUDENT NOTES CHUNKS TO COPY FROM ---\n{context_text}\n-----------------------------"
            )
            
            # 5. Fire request to Groq's active completion model
            chat_completion = client.chat.completions.create(
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_query}
                ],
                model="llama-3.1-8b-instant",  
                temperature=0.2          # Kept low to enforce structured alignment with the facts
            )

            # 6. Extract Groq's textual answer payload
            llm_answer = chat_completion.choices[0].message.content.strip()

            # 7. Append source text tracking layout metadata cleanly to the bottom
            final_answer = (
                f"{llm_answer}\n\n"
                f"---\n"
                f"📚 **Source Reference:** *{source_file_name}* | 🏷️ **Subject Track:** *{source_subject}*"
            )

            return Response({"answer": final_answer}, status=status.HTTP_200_OK)

        except Exception as e:
            print(f"Groq RAG System Pipeline Failure: {str(e)}")
            return Response(
                {"error": "Internal database or generation service error"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
