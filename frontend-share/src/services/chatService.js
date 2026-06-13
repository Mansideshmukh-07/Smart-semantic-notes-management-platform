// src/services/chatService.js
import api from "./api"; // Import your secret messenger rocket

/**
 * Sends the user's text question to the Django backend.
 * Django will turn it into a vector embedding and search PostgreSQL!
 * * @param {string} userQuery - The question typed by the student
 * @returns {Promise<string>} - The smart answer string coming back from the database
 */
export const searchNotesDatabase = async (userQuery) => {
  try {
    // Send the question to the backend endpoint
    const response = await api.post("/chat/query/", {
      query: userQuery
    });
    
    // Return just the text answer string from the server response
    return response.data.answer;
  } catch (error) {
    console.error("Error inside searchNotesDatabase service:", error);
    // Throw the error forward so the UI page knows something went wrong
    throw error;
  }
};
