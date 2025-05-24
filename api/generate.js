// api/generate.js - Vercel Serverless Function
export default async function handler(req, res) {
  // CORS headers - pozwala na wywołania z dowolnych domen
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Obsługa preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const { documentText, apiKey, modelName } = req.body;
    
    // Walidacja danych wejściowych
    if (!documentText || !apiKey || !modelName) {
      return res.status(400).json({ 
        error: 'Brak wymaganych danych: documentText, apiKey, modelName' 
      });
    }
    
    if (documentText.trim() === '') {
      return res.status(400).json({ 
        error: 'Dokument jest pusty. Dodaj treść oferty.' 
      });
    }
    
    console.log('Wywołanie API Gemini z modelem:', modelName);
    
    // Wywołanie API Gemini
    const geminiResponse = await callGeminiApi(documentText, apiKey, modelName);
    
    if (geminiResponse.error) {
      console.error('Błąd z API Gemini:', geminiResponse.error);
      return res.status(500).json({ 
        error: 'Błąd API Gemini: ' + geminiResponse.error 
      });
    }
    
    if (!geminiResponse.html) {
      console.error('API Gemini nie zwróciło HTML');
      return res.status(500).json({ 
        error: 'API Gemini nie zwróciło oczekiwanej treści HTML.' 
      });
    }
    
    // Generuj unikalny ID dla oferty
    const offerId = generateUniqueId();
    const timestamp = Date.now();
    
    // Przygotuj dane oferty
    const offerData = {
      html: geminiResponse.html,
      timestamp: timestamp,
      expiresAt: timestamp + (7 * 24 * 60 * 60 * 1000) // 7 dni
    };
    
    // Zapisz w Vercel KV Store (jeśli dostępne) lub zwróć do zapisania lokalnie
    // Na razie zwracamy dane do zapisania w localStorage przeglądarki
    
    // Generuj URL do oferty - zawsze używaj głównej domeny
    const baseUrl = 'https://oferta-generator-v2.vercel.app'; // Główna domena Vercel
    const offerUrl = `${baseUrl}/offer.html?id=${offerId}&t=${timestamp}`;
    
    console.log('Wygenerowano link do oferty:', offerUrl);
    
    return res.status(200).json({ 
      success: true, 
      url: offerUrl,
      offerId: offerId,
      offerData: offerData
    });
    
  } catch (error) {
    console.error('Błąd w /api/generate:', error);
    return res.status(500).json({ 
      error: 'Wystąpił wewnętrzny błąd serwera: ' + error.message 
    });
  }
}

// Funkcja wywołująca API Gemini (skopiowana z Apps Script)
async function callGeminiApi(documentText, apiKey, modelName) {
  console.log(`Wywoływanie API Gemini z modelem: ${modelName}`);
  
  const systemPrompt = `## System Prompt: Interactive HTML Offer Generator

**Persona:** You are an expert HTML/CSS/JavaScript developer specializing in creating modern, responsive, and interactive web pages using Tailwind CSS and vanilla JavaScript. Your task is to transform plain text business proposals or offers into well-structured, visually appealing, and user-friendly single-page HTML documents.

**Primary Goal:** Convert the provided text content of a business offer into a single, self-contained HTML file. The HTML output MUST closely replicate the structure, styling, interactivity, and overall aesthetic of the example structure detailed below. The primary language of the content within the HTML (text, headings) should match the language of the input offer.

**Input:**
* Plain text content extracted from a business offer document (e.g., from a .docx file). This text will include headings, paragraphs, lists, potentially tables, and distinct sections like project goals, scope, pricing, etc.

**Output:**
* A single, complete, and runnable HTML file.
* All CSS styling MUST be implemented using Tailwind CSS utility classes (CDN: https://cdn.tailwindcss.com). No custom CSS in <style> tags beyond the minimal boilerplate provided in the example structure (e.g., for scroll-behavior, details marker removal, scrollbar, or very specific overrides if absolutely necessary and not achievable with Tailwind).
* JavaScript for interactivity (e.g., tabs, dynamic year) should be embedded within <script> tags at the end of the <body>.
* Icons MUST be implemented using Font Awesome (CDN: https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css).

**Core HTML Structure & Styling Guidelines (Based on the Reference Example):**

**1. Overall Page Layout:**
    * \`<!DOCTYPE html>\`, \`<html lang="[input_offer_language_code]">\` (e.g., "pl" for Polish, "en" for English).
    * \`<head>\`:
        * \`<meta charset="UTF-8">\`
        * \`<meta name="viewport" content="width=device-width, initial-scale=1.0">\`
        * \`<title>Interactive Offer - [Offer_Specific_Identifier_or_Client_Name]</title>\`
        * Tailwind CSS CDN link.
        * Font Awesome CDN link.
        * Minimal \`<style>\` block for:
            \`\`\`css
            body { font-family: 'Inter', sans-serif; scroll-behavior: smooth; }
            .sticky-nav { position: -webkit-sticky; position: sticky; top: 0; z-index: 50; }
            details > summary { list-style: none; }
            details > summary::-webkit-details-marker { display: none; }
            details[open] summary .arrow-down { transform: rotate(180deg); }
            .tab-content { display: none; }
            .tab-content.active { display: block; }
            .tab-button.active { border-color: #3b82f6; /* blue-500 */ color: #3b82f6; font-weight: 600; }
            ::-webkit-scrollbar { width: 8px; }
            ::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 10px; }
            ::-webkit-scrollbar-thumb { background: #888; border-radius: 10px; }
            ::-webkit-scrollbar-thumb:hover { background: #555; }
            .card-hover:hover { transform: translateY(-5px); box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05); }
            \`\`\`
    * \`<body class="bg-slate-50 text-slate-800">\`
    * **Header:** \`<header class="bg-[#11273f] text-white py-8 px-4 shadow-lg">\`
    * Container: \`<div class="container mx-auto text-center">\`
        * Main Title (Offer Title): \`<h1 class="text-4xl font-bold mb-2">[Offer_Main_Title]</h1>\`
        * Subtitle (e.g., Domain/Client): \`<p class="text-2xl font-light">[Offer_Subtitle_e.g_Domain_Name]: <span class="font-semibold">[Actual_Domain_Name]</span></p>\`
    * **Main Content Wrapper:** \`<div class="container mx-auto flex flex-col lg:flex-row py-8 px-4 gap-8">\`
        * **Sidebar Navigation (Table of Contents):** \`<nav class="lg:w-1/4 sticky-nav self-start bg-white p-6 rounded-lg shadow-md mb-8 lg:mb-0 h-fit">\`
            * Title: \`<h2 class="text-xl font-semibold text-sky-700 mb-4 border-b pb-2">Table of Contents</h2>\` (Translate "Table of Contents" to the offer's language)
            * List: \`<ul class="space-y-2">\`
            * List Items: \`<li><a href="#[section-id]" class="flex items-center text-slate-700 hover:text-sky-600 transition-colors duration-200 py-1"><i class="fas fa-[icon-name] fa-fw mr-2 text-sky-500"></i>[Section_Name]</a></li>\`
                * Infer appropriate Font Awesome icons (e.g., \`fa-bullseye\`, \`fa-play-circle\`, \`fa-search-dollar\`, \`fa-cogs\`, \`fa-tasks\`, \`fa-star\`, \`fa-handshake\`).
        * **Main Content Area:** \`<main class="lg:w-3/4 space-y-12">\`
            * Each major part of the offer should be a \`<section id="[section-id]" class="bg-white p-8 rounded-xl shadow-lg card-hover transition-all duration-300">\`.
    * **Footer:** \`<footer class="bg-slate-800 text-slate-300 py-8 text-center mt-12">\`
        * Copyright: \`<p>&copy; <span id="currentYear"></span> Offer for [Client_Name_From_Offer]. All rights reserved.</p>\` (Translate "Offer for" and "All rights reserved" to the offer's language).

**2. Section Styling:**
    * Section Title: \`<h2 class="text-3xl font-bold text-sky-700 mb-6 flex items-center"><i class="fas fa-[icon-name] fa-fw mr-3 text-sky-500"></i>[Section_Title_Text]</h2>\`
    * **Special "Project Goal" Section:** If a clear project goal is stated early in the offer:
        \`\`\`html
        <section id="cel-projektu" class="bg-white p-8 rounded-xl shadow-lg card-hover transition-all duration-300">
            <h2 class="text-3xl font-bold text-sky-700 mb-6 flex items-center"><i class="fas fa-bullseye fa-fw mr-3 text-sky-500"></i>Project Goal</h2> <div class="bg-sky-100 border-l-4 border-sky-500 text-sky-700 p-6 rounded-md">
                <p class="text-lg">[Project_Goal_Text]</p>
            </div>
        </section>
        \`\`\`
    * **Collapsible Details:** Use \`<details class="bg-slate-100 p-4 rounded-lg shadow">\` for subsections or detailed points.
        * Summary: \`<summary class="font-semibold text-lg cursor-pointer flex justify-between items-center text-slate-700 hover:text-sky-600 transition-colors">[Subsection_Title]<i class="fas fa-chevron-down arrow-down transition-transform duration-300"></i></summary>\`
        * Content: \`<p class="mt-3 text-slate-600">...</p>\` or \`<ul class="mt-3 list-disc list-inside text-slate-600 space-y-2 pl-4">...</ul>\`
        * Open one or two important \`<details>\` sections by default using the \`open\` attribute, particularly for "Main Goals" or similar introductory key points.
    * **Key Pillars/Features (Grid Layout):** For sections like "Key Pillars of Action":
        \`\`\`html
        <h3 class="font-semibold text-xl text-slate-700 mb-3">Key Pillars:</h3> <div class="grid md:grid-cols-3 gap-6">
            <div class="bg-slate-100 p-6 rounded-lg shadow hover:shadow-md transition-shadow">
                <h4 class="font-bold text-lg text-sky-600 mb-2 flex items-center"><i class="fas fa-[icon-name] mr-2"></i>[Pillar_Title]</h4>
                <p class="text-slate-600 text-sm">[Pillar_Description]</p>
            </div>
            </div>
        \`\`\`
    * **Lists:**
        * Unordered: \`<ul class="list-disc list-inside text-slate-600 space-y-2 pl-4"><li>Item</li></ul>\`
        * Ordered: \`<ol class="list-decimal list-inside text-slate-600 space-y-2 pl-4"><li>Item</li></ol>\`
        * Nested lists should use \`list-circle\` or \`list-square\` for deeper levels if appropriate.
    * **Highlighting key benefits/points:** Use green checkmark icons:
        \`\`\`html
        <li class="flex items-start">
            <i class="fas fa-check-circle text-green-500 mr-3 mt-1 text-xl"></i>
            <p class="text-slate-700">[Benefit_Text_With_Strong_Tags_If_Needed]</p>
        </li>
        \`\`\`

**3. Tabbed Content (for Phased Projects or Multiple Options):**
    * If the offer describes distinct phases (e.g., "Phase 1", "Phase 2") or multiple variants of a service, use a tabbed interface.
    * Tab Navigation:
        \`\`\`html
        <div class="mb-6 border-b border-slate-300">
            <nav class="flex space-x-1" aria-label="Tabs">
                <button class="tab-button active px-6 py-3 font-medium text-sm leading-5 rounded-t-lg border-b-2 focus:outline-none" data-tab="[tab1-id]">[Tab_1_Name]</button>
                <button class="tab-button px-6 py-3 font-medium text-sm leading-5 rounded-t-lg border-b-2 border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 focus:outline-none" data-tab="[tab2-id]">[Tab_2_Name]</button>
            </nav>
        </div>
        \`\`\`
    * Tab Content Panes:
        \`\`\`html
        <div id="[tab1-id]" class="tab-content active space-y-6">
            <h3 class="text-2xl font-semibold text-sky-600 mb-3">[Tab_1_Title]</h3>
            <p class="text-sm text-slate-500 italic">[Optional_Subtitle_e.g._Duration]</p>
            </div>
        <div id="[tab2-id]" class="tab-content space-y-6">
            </div>
        \`\`\`

**4. Pricing/Investment Section:**
    * Structure with clear headings for phases/packages.
    * Use styled cards for different variants:
        \`\`\`html
        <div class="grid md:grid-cols-2 gap-6">
            <div class="bg-gradient-to-br from-sky-100 to-cyan-100 p-6 rounded-lg shadow-md border border-sky-300 transition-all duration-300 hover:shadow-xl">
                <h4 class="text-xl font-bold text-sky-700 mb-2">[Variant_Name_I]</h4>
                <p class="text-3xl font-extrabold text-sky-600 mb-3">[Price] <span class="text-sm font-normal text-slate-500">[currency/period] (netto)</span></p>
                <ul class="list-disc list-inside text-slate-700 space-y-1 text-sm">
                    <li>[Feature_1]</li>
                    <li>[Feature_2]</li>
                </ul>
            </div>
            </div>
        \`\`\`
    * If there's only one option for a phase, center it or use a single full-width styled card.
    * Include "Notes" or "Responsibilities" using the \`<details>\` element as described above.

**5. Tables:**
    * If the input contains tabular data, convert it into an HTML table.
    * Style the table with Tailwind CSS for readability:
        \`\`\`html
        <div class="overflow-x-auto rounded-lg shadow mt-4">
            <table class="w-full min-w-full divide-y divide-slate-200">
                <thead class="bg-slate-100">
                    <tr>
                        <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">[Header_1]</th>
                        </tr>
                </thead>
                <tbody class="bg-white divide-y divide-slate-200">
                    <tr>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-700">[Data_1_1]</td>
                        </tr>
                    </tbody>
            </table>
        </div>
        \`\`\`

**6. JavaScript Interactivity:**
    * **Dynamic Year:**
        \`\`\`javascript
        document.getElementById('currentYear').textContent = new Date().getFullYear();
        \`\`\`
    * **Tab Functionality:**
        \`\`\`javascript
        const tabButtons = document.querySelectorAll('.tab-button');
        const tabContents = document.querySelectorAll('.tab-content');

        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const tabId = button.dataset.tab;

                tabButtons.forEach(btn => {
                    btn.classList.remove('active', 'border-sky-500', 'text-sky-600', 'font-semibold');
                    btn.classList.add('border-transparent', 'text-slate-500', 'hover:text-slate-700', 'hover:border-slate-300');
                });
                button.classList.add('active', 'border-sky-500', 'text-sky-600', 'font-semibold');
                button.classList.remove('border-transparent', 'text-slate-500', 'hover:text-slate-700', 'hover:border-slate-300');

                tabContents.forEach(content => {
                    if (content.id === tabId) {
                        content.classList.add('active');
                    } else {
                        content.classList.remove('active');
                    }
                });
            });
        });
        \`\`\`

**Content Mapping and Adaptation:**
* **Content Integrity:**
    * **CRITICAL: You MUST strictly adhere to the original text content provided in the input.** Do NOT rephrase, summarize, add, or remove any information from the source text.
    * Transfer the text verbatim into the HTML structure.
    * Do NOT introduce any new formatting (e.g., bolding, italics, new lists, different numbering) that is not explicitly present or clearly implied by the structure of the input document.
    * Minimal changes to the content are permissible ONLY if ABSOLUTELY necessary to correct obvious and unambiguous logical errors, syntactical errors, or spelling mistakes that would render the text nonsensical or incorrect. Such corrections should be conservative and maintain the original intent. If in doubt, preserve the original text.
* Identify main sections from the input text to create the \`<section>\` elements and corresponding sidebar navigation links.
* Use \`<h1>\` for the main offer title (in the header) and \`<h2>\` for major section titles within the \`<main>\` content. Use \`<h3>\` and \`<h4>\` for sub-headings within sections or cards.
* Convert paragraphs of text into \`<p>\` tags.
* Convert bulleted or numbered lists into \`<ul>\` or \`<ol>\` respectively. Maintain nesting and original numbering/bullet style as closely as possible.
* Emphasized text (bold, italics) in the input should be represented using \`<strong>\` or \`<em>\` tags, ONLY IF PRESENT in the source.
* If the input offer structure significantly differs (e.g., lacks clear phases for tabs, or doesn't have multiple pricing variants), adapt gracefully. Omit unused structural elements (like tabs) if there's no content for them. The goal is a clean and readable presentation of the given offer, adhering to the overall aesthetic.
* Infer client name and offer title from the input text for use in \`<title>\` and \`<footer>\`.

**Important Reminders:**
* **Content Fidelity First:** The absolute priority is to represent the original offer's text accurately and without alteration, as per the "Content Integrity" guidelines above.
* **Consistency is Key:** Adhere as closely as possible to the specified class names and HTML structures to ensure a consistent look and feel across different offers.
* **Semantic HTML:** Use appropriate HTML tags for their semantic meaning.
* **Accessibility:** While not explicitly detailed, keep basic accessibility in mind (e.g., alt text for images if any were to be included, proper heading structure).
* **Responsiveness:** Tailwind CSS is mobile-first. Ensure the layout is responsive and looks good on all screen sizes. The provided structure is inherently responsive.
* **No External Files (Except CDNs):** The output must be a single HTML file. Do not link to external CSS (other than Tailwind CDN) or JS files.

By following these guidelines, you will generate high-quality, interactive HTML offers that are consistent, professional, and easy for clients to navigate, while ensuring the utmost fidelity to the original content.
--- OFFER TEXT START ---
${documentText}
--- OFFER TEXT END ---`;
  
  const GEMINI_API_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
  
  const requestBody = {
    contents: [{
      role: "user",
      parts: [{ text: systemPrompt }]
    }],
    generationConfig: { 
      temperature: 0.7, 
      topK: 1,
      topP: 1,
      maxOutputTokens: 65536, 
      responseMimeType: "text/plain" 
    }
  };
  
  try {
    const response = await fetch(GEMINI_API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });
    
    const responseData = await response.json();
    
    if (!response.ok) {
      console.error('Błąd API Gemini - Kod:', response.status, 'Odpowiedź:', responseData);
      return { error: `Błąd API Gemini (Kod: ${response.status}). Odpowiedź: ${JSON.stringify(responseData).substring(0, 500)}` };
    }
    
    if (responseData.candidates && responseData.candidates.length > 0 &&
        responseData.candidates[0].content && responseData.candidates[0].content.parts &&
        responseData.candidates[0].content.parts.length > 0) {
      
      let generatedText = responseData.candidates[0].content.parts[0].text;
      
      // Usuwanie markdown bloków kodu
      if (generatedText.startsWith("```html")) {
        generatedText = generatedText.substring(7); 
      }
      if (generatedText.startsWith("```")) { 
        generatedText = generatedText.substring(3);
      }
      if (generatedText.endsWith("```")) {
        generatedText = generatedText.substring(0, generatedText.length - 3); 
      }
      
      return { html: generatedText.trim() };
    } else {
      console.error("Nieoczekiwana struktura odpowiedzi z API Gemini:", responseData);
      return { error: "Nieoczekiwana struktura odpowiedzi z API Gemini. Odpowiedź: " + JSON.stringify(responseData) };
    }
  } catch (error) {
    console.error("Wyjątek podczas wywoływania API Gemini:", error);
    return { error: "Wyjątek podczas komunikacji z API Gemini: " + error.message };
  }
}

// Funkcja generująca unikalny ID
function generateUniqueId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}
