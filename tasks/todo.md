# Pulse AI Landing Page - Development Plan

## Todo Items

### 1. Download Images from Figma
- [ ] Download background image (quill background)
- [ ] Download hero image (Explore section)
- [ ] Download training screenshots
- [ ] Download navigation icons/SVGs

### 2. Set Up Project Structure
- [ ] Create HTML structure for landing page
- [ ] Set up CSS file with variables for colors and fonts
- [ ] Create assets/images directory

### 3. Build Header/Navigation Component
- [ ] Create navigation bar with "pulse." logo
- [ ] Add navigation links (About, Features, Login)
- [ ] Style header with proper spacing

### 4. Build Hero Section
- [ ] Large "pulse." title
- [ ] Subtitle "Training That Fits Your Life"
- [ ] Description paragraph
- [ ] "Get Started" CTA button
- [ ] Background styling

### 5. Build Training Schedule Preview Section
- [ ] Add background image with overlay
- [ ] Display app screenshot showing training schedule
- [ ] Add text labels (Strength, Leg Day, 30 minutes easy run)

### 6. Build "Train Anywhere" Section
- [ ] Add heading "train anywhere. no excuses."
- [ ] Add description text
- [ ] Add training/lifestyle images
- [ ] "Start Training" CTA button

### 7. Build Footer
- [ ] Add "pulse." branding
- [ ] Add founder credit text
- [ ] Add Settings/Progress navigation items

### 8. Responsive Design & Polish
- [ ] Add responsive breakpoints
- [ ] Test on different screen sizes
- [ ] Fine-tune spacing and typography
- [ ] Ensure all CTAs are functional

## Design Specifications

### Colors
- Primary Orange: #FFA200
- Black: #000000
- White: #FFFFFF
- Orange overlay: rgba(255, 162, 0, 0.3)

### Typography
- Font Family: Inter
- Large Title: 300px, weight 500
- Heading: 90px, weight 500
- Subtitle: 40px, weight 400
- Navigation: 32px, weight 500
- Button: 20px, weight 400
- Small text: 10px, weight 500

### Layout
- Desktop width: 1440px
- Border radius for buttons: 15px

---

## Review Section

### Completed Implementation

**What was built:**
- ✅ Full landing page for Pulse AI training app
- ✅ Downloaded 4 images from Figma (background, training screenshots, lifestyle photo)
- ✅ Created responsive HTML structure with semantic sections
- ✅ Built comprehensive CSS with design system matching Figma specs

**Key Features Implemented:**
1. **Header/Navigation** - "pulse." logo with About, Features, Login links
2. **Hero Section** - Large "pulse." title (300px), subtitle, description, and "Get Started" CTA
3. **Training Preview Section** - Background image with overlay, description of AI scheduling features
4. **Train Anywhere Section** - "train anywhere. no excuses." heading with lifestyle image, app screenshot, and "Start Training" CTA
5. **Footer** - Branding, founder credit, and Settings link
6. **Responsive Design** - Breakpoints for tablet (1024px) and mobile (768px)

**Design Fidelity:**
- Color scheme: Orange (#FFA200), Black, White
- Typography: Inter font family with exact weights and sizes from Figma
- Layout: 1440px max-width, proper spacing and alignment
- Interactive elements: Hover states on buttons and links

**File Structure:**
```
Pulse AI/
├── index.html
├── styles.css
├── assets/
│   └── images/
│       ├── quill-background.png
│       ├── explore-image-4639f8.png
│       ├── training-screenshot-6fd850.png
│       └── lifestyle-photo.png
└── tasks/
    └── todo.md
```

**Notes:**
- All sections built according to Figma design
- Responsive and accessible
- Clean, maintainable code structure
- Ready for deployment

---

## Updates - Design Refinement (Latest)

**Changes Made:**
1. **Color Scheme** - Updated to beige (#E8D5C4) background instead of all-orange
2. **Hero Section** - Removed description paragraph, cleaner layout with just title, subtitle, and CTA
3. **Training Preview** - Now shows phone mockup on right, description on left with proper spacing
4. **Train Anywhere** - Restructured with lifestyle photo on left, title and description on right
5. **Navigation** - Reordered to Features, About, Login (matching Figma)
6. **Footer** - Simplified to just logo and founder credit, removed Settings link
7. **Button Styling** - Solid orange background without border for cleaner look
8. **Spacing** - Improved section padding and gaps throughout for better visual hierarchy
9. **Hero Image** - Added full-width explore image below "Get Started" button

---

## Updates - Login Page Added

**New Files Created:**
- `login.html` - Login/signup page

**Features Implemented:**
1. **Layout** - Centered design with background image (quill-background.png)
2. **Elements:**
   - "pulse." logo at top
   - "Welcome Back" large heading (100px)
   - Description text about creating account
   - "Create an Account" button (orange) - links to signup.html
   - "I Already Have an Account" button (white with border)
   - Terms of Service text
   - "Back" link to return to homepage (positioned at top: 44px, left: 49px)
3. **Styling** - Matching design specs from Figma
4. **Navigation** - Login link in index.html now points to login.html
5. **Responsive** - Mobile-friendly breakpoints included

---

## Updates - Sign Up Page Added

**New Files Created:**
- `signup.html` - Sign up/registration page
- Downloaded `runner-ekiden.png` image

**Features Implemented:**
1. **Layout** - Split design with image on left, form on right
2. **Left Side:**
   - "Back" button linking to login.html
   - Runner image
   - "Start Your Truly Personal Plan" heading (120px, white text)
3. **Right Side:**
   - "pulse." logo
   - Form with fields: Email, Password, Name, Age, Height, Weight
   - Form inputs with labels and placeholders matching Figma
   - Orange "Sign Up" button (322x47px)
4. **Styling** - Complete CSS with responsive breakpoints
5. **Navigation** - "Create an Account" button in login.html links to signup.html

---

## Updates - Next.js Conversion Complete

**Conversion Summary:**
Converted the entire static HTML/CSS project to a modern Next.js 14+ App Router application with TypeScript and Tailwind CSS.

**New Project Structure:**
```
src/
├── app/
│   ├── layout.tsx          (Root layout with Inter font)
│   ├── page.tsx            (Landing page)
│   ├── globals.css         (Tailwind + custom theme)
│   ├── login/
│   │   └── page.tsx        (Login entry page)
│   ├── signin/
│   │   └── page.tsx        (Sign in form)
│   └── signup/
│       └── page.tsx        (Sign up registration)
├── components/
│   ├── Navbar.tsx          (Navigation header)
│   ├── Footer.tsx          (Footer component)
│   ├── Button.tsx          (Reusable button with variants)
│   ├── FormInput.tsx       (Form input field)
│   ├── BackLink.tsx        (Back navigation link)
│   └── landing/
│       ├── HeroSection.tsx
│       ├── TrainingPreviewSection.tsx
│       └── TrainAnywhereSection.tsx
public/
└── images/                 (All images copied here)
```

**Key Changes:**
1. **Framework**: Next.js 14 with App Router
2. **Language**: TypeScript
3. **Styling**: Tailwind CSS v4 (CSS-first config)
4. **Fonts**: Inter via next/font/google
5. **Images**: Using Next.js Image component for optimization
6. **Links**: Using Next.js Link component for client-side navigation
7. **Forms**: React controlled components with useState

**Tailwind Custom Theme (globals.css):**
- `bg-primary` → #FFA200 (orange)
- `bg-beige` → #E8D5C4 (beige background)
- `text-black` → #000000
- `text-white` → #FFFFFF

**Routes:**
- `/` → Landing page
- `/login` → Login entry (Welcome Back)
- `/signin` → Sign in form
- `/signup` → Sign up registration

**To Run:**
```bash
npm run dev     # Development server at localhost:3000
npm run build   # Production build
npm start       # Start production server
```

**Notes:**
- Original HTML/CSS files kept for reference
- Build successful with no errors
- All pages are statically generated
- Forms use preventDefault (ready for Supabase integration)
