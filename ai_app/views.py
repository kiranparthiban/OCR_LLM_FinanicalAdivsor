from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from .serializers import AnalyseFileSerializer
from .handlers import AiHandler


class AnalyseView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        # Validate the input file using the serializer
        serializer = AnalyseFileSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        file = serializer.validated_data["file"]
        file_type = file.content_type

        # Initialize the AI handler
        ai_handler = AiHandler()

        try:
            # Step 1: Extract text from the file
            extracted_text = ai_handler.extract_text(file, file_type)

            # Step 2: Generate financial summary using the extracted text
            financial_summary = ai_handler.generate_financial_summary(extracted_text)

            return Response(
                {"message": "Analysis successful.", "summary": financial_summary},
                status=status.HTTP_200_OK,
            )
        except ValueError as ve:
            return Response({"error": str(ve)}, status=status.HTTP_400_BAD_REQUEST)
        except RuntimeError as re:
            return Response({"error": str(re)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except Exception as e:
            return Response(
                {"error": f"An unexpected error occurred: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
