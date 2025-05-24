# Generator Interaktywnych Ofert HTML

Przekształć swoje oferty z Google Docs w piękne, interaktywne strony HTML jednym kliknięciem. Udostępniaj je przez publiczne linki i imponuj klientom.

## 🚀 Funkcje

- **Jeden klik** - Przekształć ofertę z Google Docs w interaktywną stronę HTML w sekundach
- **Publiczne linki** - Otrzymuj publiczne linki do udostępniania klientom
- **Responsywne** - Oferty wyglądają świetnie na wszystkich urządzeniach
- **Bookmarklet** - Prosty w instalacji i użyciu dla całego zespołu
- **Powered by Gemini AI** - Wykorzystuje najnowsze modele AI do formatowania

## 📋 Wymagania

- Konto GitHub (darmowe)
- Konto Vercel (darmowe)
- Klucz API Google Gemini (darmowy - do 1500 requestów dziennie)

## 🛠️ Instalacja

### Krok 1: Stwórz repozytorium GitHub

1. Idź na [github.com](https://github.com)
2. Kliknij "New repository"
3. Nazwij repo: `oferta-generator`
4. Zaznacz: ✅ Public i ✅ Add a README file
5. Kliknij "Create repository"

### Krok 2: Dodaj pliki do repozytorium

Skopiuj wszystkie pliki z tego projektu do swojego repozytorium:

```
oferta-generator/
├── api/
│   └── generate.js          # Główny endpoint API
├── index.html               # Strona główna z instrukcjami
├── offer.html               # Strona wyświetlająca oferty
├── bookmarklet.js           # Kod bookmarklet
├── package.json             # Konfiguracja projektu
└── README.md                # Ta instrukcja
```

### Krok 3: Deploy na Vercel

1. Idź na [vercel.com](https://vercel.com)
2. Zaloguj się przez GitHub
3. Kliknij "New Project"
4. Wybierz swoje repo `oferta-generator`
5. Kliknij "Deploy"
6. Poczekaj na zakończenie deployment

### Krok 4: Przetestuj

1. Otwórz deployment URL (np. `https://oferta-generator-xyz.vercel.app`)
2. Postępuj zgodnie z instrukcjami na stronie
3. Dodaj bookmarklet do przeglądarki
4. Przetestuj w Google Docs

## 🔧 Jak używać

### 1. Dodaj bookmarklet

- Idź na swoją stronę deployment
- Przeciągnij przycisk "Generator Ofert" do paska zakładek

### 2. Skonfiguruj klucz API

- Pobierz klucz API z [Google AI Studio](https://aistudio.google.com/app/apikey)
- Przy pierwszym użyciu bookmarklet poprosi o klucz

### 3. Generuj oferty

1. Otwórz ofertę w Google Docs
2. Kliknij bookmarklet "Generator Ofert"
3. Kliknij "Generuj Ofertę"
4. Otrzymaj publiczny link

## 📁 Struktura plików

### `api/generate.js`
Główny endpoint API który:
- Odbiera tekst z Google Docs
- Wywołuje API Gemini z promptem formatowania
- Zwraca wygenerowany HTML i publiczny link

### `index.html`
Strona główna z:
- Instrukcjami instalacji
- Bookmarklet do pobrania
- FAQ i dokumentacją

### `offer.html`
Strona wyświetlająca wygenerowane oferty:
- Ładuje oferty z localStorage
- Obsługuje wygaśnięcie linków (7 dni)
- Wyświetla błędy w przyjazny sposób

### `bookmarklet.js`
Kod JavaScript bookmarklet który:
- Sprawdza czy jesteśmy w Google Docs
- Pobiera tekst z dokumentu
- Tworzy interfejs użytkownika
- Wywołuje API `/api/generate`

## 🔒 Bezpieczeństwo

- Klucze API są przechowywane tylko lokalnie w przeglądarce
- Oferty są tymczasowo przechowywane (7 dni)
- Wszystkie żądania API idą bezpośrednio z przeglądarki do Gemini
- Brak logowania ani rejestracji

## 🌟 Funkcje dla zespołów

- Każdy może dodać bookmarklet ze swojego klucza API
- Nie ma limitów użytkowników
- Prosty link do udostępnienia: wyślij URL swojej strony

## ⚡ Rozwiązywanie problemów

### Bookmarklet nie działa
- Upewnij się, że jesteś w Google Docs
- Sprawdź czy dokument jest w trybie edycji
- Sprawdź konsolę przeglądarki (F12)

### Błąd API Gemini
- Sprawdź czy klucz API jest prawidłowy
- Sprawdź limity API w Google AI Studio
- Spróbuj z innym modelem Gemini

### Oferta nie ładuje się
- Sprawdź czy link nie wygasł (7 dni)
- Otwórz link w tej samej przeglądarce gdzie generowałeś
- Sprawdź localStorage w narzędziach deweloperskich

## 📞 Wsparcie

Jeśli masz problemy:
1. Sprawdź sekcję FAQ na stronie głównej
2. Zajrzyj do Issues w tym repozytorium
3. Sprawdź logi w Vercel Dashboard

## 📄 Licencja

MIT License - możesz swobodnie używać, modyfikować i dystrybuować.

---

Utworzone z ❤️ przy użyciu Gemini AI, Vercel i Tailwind CSS
