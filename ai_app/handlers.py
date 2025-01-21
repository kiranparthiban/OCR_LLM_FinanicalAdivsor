from PIL import Image
from PyPDF2 import PdfReader
import pytesseract
from langchain_groq import ChatGroq
import os


class AiHandler:
    """
    AI Handler for extracting text from files and generating financial summaries.
    """

    def __init__(self):
        """
        Initialize the Groq LLM with the desired model and API key.
        """
        # Set the path to the Tesseract executable
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        tesseract_path = os.path.join(base_dir, "ai_engine", "tesseract.exe")
        pytesseract.pytesseract.tesseract_cmd = tesseract_path

        # Initialize the Groq LLM
        self.llm = ChatGroq(
            model="llama3-70b-8192",  # Replace with your desired Groq model
            temperature=0.7,
            api_key="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",
        )

    def extract_text(self, file, file_type):
        """
        Extract text from the uploaded file based on its type (image or PDF).
        
        :param file: The uploaded file.
        :param file_type: MIME type of the file (e.g., image/jpeg, application/pdf).
        :return: Extracted text from the file.
        """
        try:
            if file_type.startswith("image"):
                # Process image file
                image = Image.open(file)
                extracted_text = pytesseract.image_to_string(image)
            elif file_type == "application/pdf":
                # Process PDF file
                pdf_reader = PdfReader(file)
                extracted_text = " ".join([page.extract_text() for page in pdf_reader.pages])
            else:
                raise ValueError("Unsupported file format.")
            return extracted_text
        except Exception as e:
            raise RuntimeError(f"Error extracting text: {str(e)}")

    def generate_financial_summary(self, extracted_text):
        """
        Generate a financial analysis and suggestions based on the bill content using the Groq LLM.
        
        :param extracted_text: The text extracted from the file.
        :return: Financial analysis and improvement suggestions as plain text.
        """
        try:
            # Professionally crafted prompt with context and plain text output
            prompt = f"""
            You are a financial assistant powered by advanced AI technology. Your task is to analyze the content of a bill and provide financial insights and suggestions for improvement. The bill may include details such as charges, taxes, subtotals, and payment information.

            Based on the analysis:
            1. Summarize the key financial details, including total charges, taxes, and any other relevant information.
            2. Highlight any unusual patterns or potential areas of concern in the bill, such as excessive charges or inconsistencies.
            3. Provide actionable recommendations for improving financial efficiency, including budgeting strategies, cost-saving measures, or avoiding unnecessary expenses.

            The bill content is as follows:
            {extracted_text}

            Please respond with a clear and detailed analysis, including your observations, insights, and suggestions for financial improvement. Avoid using JSON or structured formats—just provide plain text.
            """
            # Invoke the Groq LLM
            response = self.llm.invoke([{"role": "user", "content": prompt}])
            return response.content
        except Exception as e:
            raise RuntimeError(f"Error generating financial summary: {str(e)}")
