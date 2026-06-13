from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
# ── 1. Import your custom User model here ──────────────────────────────────
from .models import User, UploadedFile, NoteChunk

# ── 2. Register your custom User model using Django's built-in UserAdmin ───
@admin.register(User)
class CustomUserAdmin(UserAdmin):
    # This ensures your custom user dashboard looks like a standard, robust Django user panel
    pass


@admin.register(UploadedFile)
class UploadedFileAdmin(admin.ModelAdmin):
    list_display = ('filename', 'subject', 'user', 'file_type', 'uploaded_at')
    list_filter = ('file_type', 'subject', 'uploaded_at')
    search_fields = ('filename', 'subject', 'user__username')


@admin.register(NoteChunk)
class NoteChunkAdmin(admin.ModelAdmin):
    list_display = ('id', 'file', 'chunk_index', 'get_short_text')
    list_filter = ('file__subject',)
    search_fields = ('chunk_text', 'file__filename')

    def get_short_text(self, obj):
        if len(obj.chunk_text) > 75:
            return f"{obj.chunk_text[:75]}..."
        return obj.chunk_text
    get_short_text.short_description = 'Snippet Preview'




"""from django.contrib import admin
from .models import UploadedFile, NoteChunk

@admin.register(UploadedFile)
class UploadedFileAdmin(admin.ModelAdmin):
    # Added 'subject' to the list display columns
    list_display = ('filename', 'subject', 'user', 'file_type', 'uploaded_at')
    search_fields = ('filename', 'subject', 'user__username')

@admin.register(NoteChunk)
class NoteChunkAdmin(admin.ModelAdmin):
    list_display = ('id', 'file', 'chunk_index')
    search_fields = ('chunk_text', 'file__filename')

    """
"""from django.contrib import admin
from .models import UploadedFile, NoteChunk

@admin.register(UploadedFile)
class UploadedFileAdmin(admin.ModelAdmin):
    # Kept your exact list columns layout
    list_display = ('filename', 'subject', 'user', 'file_type', 'uploaded_at')
    
    # Adds a useful right-hand sidebar menu to filter quickly by subject or file category
    list_filter = ('file_type', 'subject', 'uploaded_at')
    
    # Kept your exact search configuration
    search_fields = ('filename', 'subject', 'user__username')


@admin.register(NoteChunk)
class NoteChunkAdmin(admin.ModelAdmin):
    # Appended a text snippet preview column so you can read a glance of the text directly
    list_display = ('id', 'file', 'chunk_index', 'get_short_text')
    
    # Allows filtering chunks by their parent file's subject
    list_filter = ('file__subject',)
    
    # Kept your exact search fields
    search_fields = ('chunk_text', 'file__filename')

    # Helper method to truncate text paragraphs to 75 characters in the list panel
    def get_short_text(self, obj):
        if len(obj.chunk_text) > 75:
            return f"{obj.chunk_text[:75]}..."
        return obj.chunk_text
    get_short_text.short_description = 'Snippet Preview'
"""
