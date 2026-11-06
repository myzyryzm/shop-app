import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Header } from "./components/Header";
import { CartPage } from "./pages/CartPage";
import { CatalogPage } from "./pages/CatalogPage";
import { ProductPage } from "./pages/ProductPage";
import { CartProvider } from "./state/CartContext";
import { SessionProvider } from "./state/SessionContext";

export function App() {
  return (
    <BrowserRouter>
      <SessionProvider>
        <CartProvider>
          <Header />
          <main className="main">
            <Routes>
              <Route path="/" element={<CatalogPage />} />
              <Route path="/products/:id" element={<ProductPage />} />
              <Route path="/cart" element={<CartPage />} />
            </Routes>
          </main>
        </CartProvider>
      </SessionProvider>
    </BrowserRouter>
  );
}
