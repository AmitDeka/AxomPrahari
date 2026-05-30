# UI/UX Design Brief 🛡️
## Project: Axom Prahari (The Civic Sentinel)

This UI/UX Brief outlines the aesthetic identity, typographic systems, core component styles, and user interaction rules designed to provide a premium, accessible, and high-trust experience across the Axom Prahari ecosystem.

---

## 1. Core Visual Identity
The system design revolves around **trust, civic duty, efficiency, and safety**. The styling should feel professional, state-backed, yet modern and highly responsive.

### 1.1 Color Palette
We avoid generic web colors, adopting a curated palette inspired by the natural landscapes of Assam combined with modern UI colors.

#### 1.1.1 Primary Themes (Teal & Forest Green)
*   **Primary Deep (State Trust):** HSL `184, 60%, 15%` (Deep Indigo-Teal)
*   **Accent Green (Safety & Verification):** HSL `142, 70%, 45%` (Assam Forest Emerald)
*   **Warning Gold (Caution & Penalties):** HSL `38, 92%, 50%` (Vibrant Mustard Gold)
*   **Destructive Crimson (Rejection & Violations):** HSL `0, 84%, 60%` (Signal Red)

#### 1.1.2 UI Surface Hues (Light & Dark Modes)
*   **Light Mode:**
    *   Background: HSL `210, 20%, 98%` (Soft Off-White)
    *   Surface Cards: HSL `0, 0%, 100%` (Pure White)
    *   Borders: HSL `210, 16%, 93%` (Light Gray-Blue)
*   **Dark Mode (Glassmorphism):**
    *   Background: HSL `222, 47%, 11%` (Midnight Slate)
    *   Surface Cards: HSL `223, 47%, 16%` with `80%` opacity (Glass Navy)
    *   Borders: HSL `217, 32%, 17%` (Deep Slate Border)

---

## 2. Typography
A uniform typeface system is enforced to project clarity and modern aesthetics.

*   **Primary Typography Engine:** `Outfit` (Primary headings, counts, numbers) and `Inter` (Body content, forms, table content).
*   **Hierarchy Scale:**
    *   `Display Title (H1)`: 32px / Bold / Tracking -0.02em
    *   `Section Title (H2)`: 24px / Semi-Bold / Tracking -0.01em
    *   `Card Heading (H3)`: 18px / Medium
    *   `Body Text`: 14px / Regular
    *   `Caption & Status Details`: 12px / Medium / Tracking 0.05em (All-Caps where appropriate)

---

## 3. Citizen Mobile Application UX (Jetpack Compose)

The mobile experience prioritizes single-handed operations, immediate visual responses, and clarity when handling media.

### 3.1 Key Design Rules
1.  **Bottom-Weighted Action Zones:** Keep the floating action button (FAB) for reporting within thumb reach in the bottom-right corner.
2.  **No-Latency Camera Interface:** The camera viewport launches instantly upon clicking the report action. Controls (Record, Shoot, Toggle Flash) use standard, high-contrast layouts.
3.  **Dynamic Status Badges:** Clear visual indications of verification states:
    *   `Pending`: Soft amber pill badge with a clock icon.
    *   `Accepted`: Soft green pill badge with a checkmark.
    *   `Rejected`: Soft red pill badge with a crossmark.
4.  **Haptic Feedback:** Micro-vibrations on camera trigger, successful submission, and screen transitions to increase user confidence.

---

## 4. Web Admin Dashboard UI (Next.js / Radix UI / Shadcn)

The web dashboard is designed as a productivity console. It focuses on dense, easily scannable data layouts, split-screen reviews, and interactive data visualization.

### 4.1 Interface Layout
*   **Sidebar Navigation:** A clean, collapsible navigation sidebar using glassmorphic blurs (`backdrop-filter: blur(8px)`).
*   **Splitscreen Review Console:**
    *   *Left Side:* Interactive video/image player showing the incident evidence with zoom controls.
    *   *Right Side:* Scrollable pane with report metadata (Citizen ID, coordinates with inline mini-map, vehicle number field, date/time inputs, and action buttons).
*   **Interactive Heatmap Screen:**
    *   Full-page Mapbox canvas.
    *   Color-coded incident clusters (Red for dense violation zones, shifting to Green in safer areas).
    *   Hover popovers displaying localized statistics.

---

## 5. Micro-interactions & Transitions

Micro-interactions are crucial for a premium feel. We use the following specifications:

*   **Button Hovers:** Subtle lift effects (`transform: translateY(-2px)`) combined with shadow transitions.
*   **Activity Skeleton Loaders:** Data grids and cards use a pulsating shimmer effect during network fetches, rather than boring loading spinners.
*   **Paging Transitions:** Horizontal slide-in/slide-out animations in Compose and page-fade transitions in Next.js to provide application depth.
*   **Refresh Feed:** Standard "pull-to-refresh" with an custom animated Assam rhino or shield spinner.
