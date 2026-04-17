# E-commerce Web Integration Specification

## Overview
A new e-commerce project built with Next.js Commerce template. It resides in the `web` folder. 
It communicates strictly via REST API with the existing VADMIN backend (Laravel).

## Requirements
1. **Authentication:** Uses customers from VADMIN. Registering creates a record in the `customers` table of VADMIN.
2. **Products:** Products are created in VADMIN and queried via REST API by the Next.js e-commerce.
3. **Orders:** Create new models and tables in VADMIN for storing Customer Orders and their complete details.
4. **CORS:** Ensure CORS is configured properly in VADMIN to allow requests from the Web frontend.

## Architecture
- **Web App:** Next.js Commerce in `/web` directory.
## UI Customization
1. **Dark Mode:** The admin panel supports dark and light themes. 
2. **Toggle:** A theme toggle (Switch) must be available in the user dropdown menu for quick access.
3. **Persistence:** Theme selection must persist across sessions using LocalStorage.

## Inventory Management
1. **Stock Levels:** Products must support minimum and maximum stock levels per variant.
2. **Alerts:** (Future) System should flag variants when stock is below `min_stock`.
