from django.db import models
from django.contrib.auth.models import AbstractUser
from pgvector.django import VectorField, HnswIndex # 1. IMPORT HnswIndex HERE

class User(AbstractUser):
    """
    Model 1: Custom user model.
    """
    pass


class UploadedFile(models.Model):
    """
    Model 2: Tracks the structural document/image files uploaded by a student.
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='uploaded_files')
    filename = models.CharField(max_length=255)
    subject = models.CharField(max_length=150, default="General")
    file_path = models.CharField(max_length=500)  
    file_type = models.CharField(max_length=50)   
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.filename} ({self.subject}) - Uploaded by {self.user.username}"


class NoteChunk(models.Model):
    """
    Model 3: Stores sliced blocks of extracted text alongside their 
    mathematical vector representation for semantic search.
    """
    file = models.ForeignKey(UploadedFile, on_delete=models.CASCADE, related_name='chunks')
    chunk_text = models.TextField()
    chunk_index = models.IntegerField()
    embedding = VectorField(dimensions=384, null=True, blank=True)

    # 2. ADD THIS METACLASS BLOCK FOR AUTOMATED INDEXING
    class Meta:
        indexes = [
            HnswIndex(
                name="note_chunk_vector_hnsw_idx",
                fields=["embedding"],
                opclasses=["vector_cosine_ops"], # Optimizes for <=> Cosine Distance search
            )
        ]

    def __str__(self):
        return f"Chunk {self.chunk_index} of {self.file.filename}"
