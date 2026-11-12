
# My Shop POS

An offline Point of Sale (POS) mobile app built with **Expo (React Native)** and **SQLite**. Shop owners can add products, create bills, and view sales history. Everything is stored on the phone, so the app works without internet.

## Features

- **Billing**: add a product (name, price, category) and it goes straight into the cart. Change quantity with + / − buttons, then save the bill.
- **Smart suggestions**: type in the product name field and suggestions appear after a 300ms debounce (for example, typing "so" shows Soap, Bath Soap). Selecting one fills the price and category automatically.
- **Categories**: Fruits, Vegetables, Soap, Brush, Grocery and Other, with filter chips to browse products.
- **Products screen**: view all saved products and delete them.
- **History screen**: bills grouped by date (Today, Yesterday, 28 Oct 2026), each date showing the bill count and the day's total.
- **Today's total** is always shown in the header.
- **Offline first**: data is saved in a local SQLite database file (`pos.db`) and stays after the app is closed.

## Tech Stack

| Purpose | Tool |
|---|---|
| Framework | Expo (React Native) |
| Routing | Expo Router |
| Database | `expo-sqlite` |
| Language | TypeScript |
| APK build | EAS Build |

## Project Structure

```
app/
├── src/
│   ├── app/
│   │   ├── _layout.tsx   # SQLiteProvider, table creation, migration
│   │   ├── index.tsx     # Main POS screen (Billing, Products, History tabs)
│   │   └── explore.tsx   # Explore tab (Expo starter template screen)
│   ├── components/       # Reusable UI components from the Expo template
│   ├── constants/        # Theme constants
│   └── hooks/            # Custom hooks
├── app.json              # App name, package name, plugins
├── eas.json              # EAS build profiles (APK)
└── package.json
```

## Screens

| File | Purpose |
|---|---|
| `src/app/index.tsx` | Main POS screen with the Billing, Products and History tabs |
| `src/app/explore.tsx` | Explore tab from the Expo starter template |

## Database

Three tables are created automatically when the app starts:

```sql
products (id, name, price, category)
sales (id, total, created_at)
sale_items (id, sale_id, product_id, qty, price)
```

Saving a bill uses a **transaction**, so a bill and its items are saved together or not at all. If an older database has no `category` column, a migration adds it without losing data.

## How It Works

1. **Add / Update Product**: saves or updates the product in SQLite and adds it to the cart.
2. **Cart**: quantity can be changed, and the total is calculated live.
3. **Save Bill**: inserts into `sales` and `sale_items` inside one transaction.
4. **History**: bills are loaded from SQLite, grouped by date using a `Map`, and displayed with `SectionList`.
5. **Debounce**: the search runs only after the user stops typing for 300ms, which avoids unnecessary work on every key press.

## Getting Started

**Requirements:** Node.js and the Expo Go app (or an Android emulator).

```bash
# install dependencies
npm install

# start the app
npx expo start
```

Scan the QR code with Expo Go to run it on your phone.

## Build the APK

```bash
npm install -g eas-cli
eas login
eas build:configure
eas build -p android --profile preview
```

The `preview` profile in `eas.json` uses `"buildType": "apk"`, so the result can be installed directly on an Android phone.

If Git is not installed on your machine, set this before building:

```bash
set EAS_NO_VCS=1
```

## Notes

- Data lives in the app's private storage on the phone. Uninstalling the app deletes it.
- Updating the app with the same package name (`com.preetika.myshoppos`) keeps the data.
- The APK starts with an empty database, separate from the data in your development build.

## Future Improvements

- Bill details screen (items, quantity and price for each bill)
- Backup and export of the database file
- Debounce search in the product list
- Custom app icon

## Author

Preetika M, 
Software Intern at AVANEXA Technologies
