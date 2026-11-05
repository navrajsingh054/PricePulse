import AddProductforms from "@/components/ui/AddProductforms";
import AuthButton from "@/components/ui/AuthButton";
import { createClient } from "@/utils/supabase/server";
import {
  Bell,
  Rabbit,
  Shield,
  TrendingDown,
} from "lucide-react";
import Image from "next/image";
import { getProducts } from "./actions";
import ProductCard from "@/components/ui/ProductCard";

export default async function Home() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const products = user ? await getProducts() : [];

  const FEATURES = [
    {
      icon: Rabbit,
      title: "Lightning Fast",
      description:
        "Price Pulse extracts prices in seconds, handling JavaScript and dynamic content",
    },
    {
      icon: Shield,
      title: "Always Reliable",
      description:
        "Works across all major e-commerce sites with built-in anti-bot protection",
    },
    {
      icon: Bell,
      title: "Smart Alerts",
      description:
        "Get notified instantly when prices drop below your target",
    },
  ];

  return (
    <main className="min-h-screen bg-linear-to-br from-orange-50 via-white to-orange-50">

      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-gray-200 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">

          {/* Logo */}
          <div className="flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="PricePulse Logo"
              width={200}
              height={70}
              className="h-14 w-auto object-contain"
              priority
            />
          </div>

          <AuthButton user={user} />

        </div>
      </header>

      {/* Hero Section */}
      <section className="px-4 py-16 md:py-20">
        <div className="mx-auto max-w-7xl text-center">

          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-orange-100 px-6 py-2 text-sm font-medium text-orange-700">
            Made with ❤︎ by Navraj Singh
          </div>

          <h1 className="mb-4 text-4xl font-bold tracking-tight text-gray-900 md:text-5xl">
            Never Miss a Price Drop
          </h1>

          <p className="mx-auto mb-10 max-w-2xl text-base leading-relaxed text-gray-600">
            Track prices from any e-commerce site. Get instant alerts when
            prices drop. Save money effortlessly.
          </p>

          {/* Add Product Form */}
          <AddProductforms user={user} />

          {/* Feature Cards */}
          {products.length === 0 && (
            <div className="mx-auto mt-16 grid max-w-4xl gap-6 md:grid-cols-3">

              {FEATURES.map(({ icon: Icon, title, description }) => (
                <div
                  key={title}
                  className="flex min-h-41.25 flex-col items-center justify-center rounded-xl border border-gray-200 bg-white p-6"
                >
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-orange-100">
                    <Icon className="h-6 w-6 text-orange-500" />
                  </div>

                  <h3 className="mb-2 text-lg font-semibold text-gray-900">
                    {title}
                  </h3>

                  <p className="text-sm leading-relaxed text-gray-600">
                    {description}
                  </p>
                </div>
              ))}

            </div>
          )}

        </div>
      </section>

      {/* Tracked Products */}
      {user && products.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pb-20">

          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">
              Your Tracked Products
            </h2>

            <span className="text-sm text-gray-500">
              {products.length}{" "}
              {products.length === 1 ? "product" : "products"}
            </span>
          </div>

          {/* Single-column product layout */}
          <div className="grid gap-6 md:grid-cols-2 items-start">
            {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
          </div>
        </section>
      )}

      {/* Empty Product State */}
      {user && products.length === 0 && (
        <section className="mx-auto max-w-2xl px-4 pb-20 text-center">
          <div className="rounded-xl border-2 border-dashed border-gray-300 bg-white p-12">

            <TrendingDown className="mx-auto mb-4 h-16 w-16 text-gray-400" />

            <h3 className="mb-2 text-xl font-semibold text-gray-900">
              No products yet
            </h3>

            <p className="text-gray-600">
              Add your first product above to start tracking prices!
            </p>

          </div>
        </section>
      )}

    </main>
  );
}