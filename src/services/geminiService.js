const API_KEY = process.env.REACT_APP_GEMINI_API_KEY;
const MODEL = 'gemini-2.0-flash-001';

export class GeminiService {
  static async describeProduct(imageFile) {
    try {
      // Convert image to base64
      const base64Image = await this.fileToBase64(imageFile);

      const body = {
        contents: [
          {
            parts: [
              {
                inlineData: {
                  mimeType: imageFile.type,
                  data: base64Image
                }
              },
              {
                text: `
                    Ignore all previous instructions. You are starting a fresh task.

                    You are assisting in creating a short product listing for a second-hand give and take marketplace, based on a single image of the item.

                    Your task has **four parts**:

                    ---

                    **1. Item Name**

                    Generate a short, descriptive name for the item shown in the image.
                    - Use 2-5 words maximum
                    - Be specific and descriptive
                    - Use simple, everyday language
                    - Focus on the main identifying characteristics
                    - Examples: "Wooden Coffee Table", "Leather Armchair", "Bluetooth Speaker", "Running Shoes"

                    ---

                    **2. Description**

                    Your task is to describe the main item shown in the image in 1–2 short, factual sentences.

                    Write the description as if you’re the person giving the item, but **don’t mention yourself at all** — just describe the item naturally and directly, like a casual, helpful note from someone who already used it and now wants to pass it on.
                    
                    ✅ Do:
                    Use a first-person seller style, e.g., "Solid wood coffee table with a smooth finish." or "Comfy armchair with a floral pattern."
                    
                    Be short and direct, only describing what is clearly and visually visible in the image.
                    
                    Use simple and informal phrasing, just like someone writing a quick post to sell something.

                    ✅ Examples:
                    "Wooden desk with metal legs, brown finish. Used it for studying — very stable and roomy."

                    "Compact microwave with simple buttons. Worked great for quick meals."
                  
                    "Comfy armchair with a gray fabric cover and wide armrests."
                    
                    ❌ Do not:
                    Do not start with phrases like "This is...", “I’m giving...”, "There is...", or "It looks like..." — avoid external or observational phrasing.

                    Do not use the word "sell" or "selling" in your response.
                    
                    Do not describe the item's condition (e.g., "in great shape", "like new", "needs repair") — this will be selected separately by the user.
                    
                    Do not guess or assume anything that isn't clearly visible — such as brand, model, how it works, or how it was used.
                    
                    Do not use uncertain language like "seems to be", "might be", "appears to be", or "probably".
                    
                    📌 If you are unsure about something, simply leave it out. Only describe what is visually clear.

                    ---

                    **3. Category**

                    - Select the **single most specific category** from the list below that matches the item in the image.
                    - Return the **exact category name** (do not modify, rephrase, or invent your own).

                    - 🛋️ Furniture  
                    - 🧊 Home Appliances  
                    - 🍽️ Kitchenware  
                    - 📦 Storage & Organization  
                    - 💡 Lighting & Decor  
                    - 🪴 Garden & Outdoor  
                    - 🚿 Bathroom Items  
                    - 🧼 Cleaning Supplies  
                    - 🛠️ Tools & Repairs  

                    - 💻 Laptop & Tech  
                    - 📱 Tablet & Accessories  
                    - 🎒 Backpacks  
                    - 📚 Study Materials  
                    - 📖 Academic Books  
                    - 🖨️ Printer & Ink  
                    - 🎧 Headphones  

                    - 👔 Men's Clothing  
                    - 👗 Women's Clothing  
                    - 👟 Shoes  
                    - 🧢 Accessories  
                    - 🧳 Travel Bags  
                    - 🧴 Personal Care  

                    - 📚 Books  
                    - 🎲 Board Games  
                    - 🎮 Gaming  
                    - 🎸 Musical Instruments  
                    - 🎨 DIY & Hobbies  
                    - 📺 TV & Media Devices  
                    - 📱 Phones & Gadgets  
                    - 🏀 Sports Gear  
                    - 🏕️ Camping & Travel  
                    - 🐾 Pet Supplies  

                  Return the exact category name from this list (not a custom one).
                
                **4. Attribute Fields**  

                Suggest **at least 1 and up to 4 attribute fields** that would help a potential buyer better understand the item.  
                - Focus on **practical traits specific to this item type** (e.g., "Battery Life", "Size", "Connectivity", "Fabric").  
                - Only include fields that make sense for this specific type of item.  
                - Use concise, short and clear labels
                - Return only 1–3 fields if that's all that makes sense. Never add irrelevant fields just to reach 4.
                - Do **not** include general or obvious fields like "Brand" or "Color" unless truly relevant. 
                - Do **not** include a "Condition" field — that will be added manually in the UI.  
                Respond in the following JSON format:
                  {
                    "name": "Short descriptive name",
                    "description": "One or two short sentences describing the item naturally.",
                    "category": "📱 Phones & Gadgets",
                    "fields": [
                      "Field 1:",
                      "Field 2:",
                      ...
                    ]
                  }
                #request_id: ${Date.now()}
              `
              }
            ]
          }
        ]
      };

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        }
      );

      const data = await response.json();
      const output = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response';
      
      console.log('Gemini API raw response:', data);
      console.log('Gemini output before parse:', output);

      // Extract JSON from code block, fallback to raw text
      let jsonText = output.trim();
      const codeBlockMatch = jsonText.match(/```json\s*([\s\S]*?)```/i) || jsonText.match(/```([\s\S]*?)```/i);
      if (codeBlockMatch) {
        jsonText = codeBlockMatch[1].trim();
      }
      // Try cleaning up smart quotes if they exist (just in case)
      jsonText = jsonText
        .replace(/['']/g, "'")
        .replace(/[""]/g, '"');

      try {
        let result = JSON.parse(jsonText);
        if (!result.fields || !Array.isArray(result.fields)) result.fields = [];
        if (!result.name) result.name = '';
        return result;
      } catch (parseError) {
        console.error('❌ Failed to parse Gemini response:', parseError, '\n🧾 Raw output:', jsonText);
        throw new Error('Invalid response format from AI service.');
      }
    } catch (error) {
      console.error('Failed to generate description:', error);
      throw error;
    }
  }

  static fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = error => reject(error);
    });
  }
} 