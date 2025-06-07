# Client-Mode RAG / Local Knowledge Base

## Introduction

Client-Mode Retrieval Augmented Generation (RAG), also known as a Local Knowledge Base, allows you to leverage the power of RAG directly within your desktop application. Instead of relying solely on a remote server, your computer processes and stores the data, enabling you to build and query a knowledge base locally.

**Key Benefits:**

*   **Privacy:** Your data remains on your local machine, offering enhanced privacy as files are not uploaded to a remote server for processing in this mode.
*   **Offline Access (to indexed data):** Once files are processed and indexed into your local knowledge base, you can perform searches and retrieve information even when you are offline. (Note: Initial processing or future updates requiring new model data might need an internet connection).

## Enabling Client-Mode RAG

To start using your Local Knowledge Base, you first need to enable it in the application settings:

1.  Navigate to the application **Settings**. This is typically found via a gear icon or a "Settings" option in the main menu or sidebar.
2.  Within Settings, locate the **Knowledge Base** section.
3.  Find the toggle switch labeled **"Enable Local Knowledge Base"**.
4.  Click the switch to turn it **on**.

Once enabled, you will see options to manage your local knowledge base files.

## Managing Your Local Knowledge Base

After enabling the feature, you can start adding, viewing, and removing documents.

### Adding Files

1.  Click the **"Add File to Local Knowledge Base"** button. This will open a system file dialog.
2.  Select the file you wish to add from your computer. The application's main process handles the file selection and path access.
3.  Once a file is selected, it will be processed locally:
    *   The text content is extracted.
    *   The text is split into manageable chunks.
    *   These chunks, along with placeholder embeddings (see "Current Status and Limitations" below), are stored in your local vector database.
    *   You should see a notification indicating whether the file processing was successful.

### Viewing Indexed Files

A list of documents that have been added to your local knowledge base will be displayed in the "Indexed Documents" section. For each document, you'll typically see:

*   **File Name:** The name of the original file.
*   **Content Hint:** A short preview of the text content from the beginning of the file.
*   **Total Chunks:** The number of text chunks the document was divided into.

This list helps you keep track of what's currently in your local knowledge base.

### Removing Files

If you no longer need a document in your local knowledge base:

1.  Find the document in the "Indexed Documents" list.
2.  Click the **"Delete"** button (often represented by a trash can icon) next to the document entry.
3.  A confirmation prompt will appear to prevent accidental deletion. Confirm that you wish to remove the document.
4.  The application will then remove all associated chunks and embeddings for that document from your local database.

## Current Status and Limitations (IMPORTANT)

This initial release of the Client-Mode RAG / Local Knowledge Base feature provides the foundational framework for local data management and the RAG pipeline. However, there are important limitations to be aware of:

*   **Placeholder Embeddings:** The current version uses **placeholder embeddings**. This means that while files are processed, chunked, and stored, the embeddings generated do not yet carry true semantic meaning. Consequently, the quality of semantic search results based on these placeholder embeddings will be minimal or effectively random. The primary purpose of this release is to test the file management pipeline (adding, listing, deleting) and the overall structure of the local RAG feature.

*   **Future Enhancements:** We are actively working on integrating real embedding generation capabilities. Future updates will include options to:
    *   Configure an API key for services like OpenAI to generate high-quality embeddings.
    *   Potentially integrate with local model providers (e.g., via Ollama or other similar tools) to generate embeddings entirely offline.

This initial version is a stepping stone towards a fully functional local RAG experience. Your feedback on the current file management and usability is highly valuable as we develop these crucial embedding features.

## Troubleshooting and Feedback

If you encounter any issues with enabling the feature, adding, or removing files, or if you have suggestions for improvement, please let us know!

*   **Reporting Issues:** Please report any bugs or unexpected behavior through our official issue tracker (e.g., GitHub Issues for the project).
*   **Feedback:** Share your feedback and ideas in our community forum or discussion channels.

Your input is crucial for making this feature robust and user-friendly.Okay, I have created the markdown documentation for the Client-Mode RAG feature. It covers the introduction, enabling the feature, managing files, and importantly, the current limitations regarding placeholder embeddings and future enhancements.
