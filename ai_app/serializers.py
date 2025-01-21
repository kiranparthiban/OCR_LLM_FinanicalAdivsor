from rest_framework import serializers

class AnalyseFileSerializer(serializers.Serializer):
    """
    Serializer to validate the uploaded file.
    """
    file = serializers.FileField()

    def validate_file(self, file):
        # Allowed MIME types
        valid_mime_types = ["image/jpeg", "image/png", "application/pdf"]

        # Validate MIME type
        if file.content_type not in valid_mime_types:
            raise serializers.ValidationError(
                "Unsupported file format. Only JPEG, PNG, or PDF allowed."
            )

        # Validate file size (limit: 5MB)
        if file.size > 5 * 1024 * 1024:
            raise serializers.ValidationError("File size exceeds 5MB.")

        return file
