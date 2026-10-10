"use client";

import { cart, toggleWishlist, wishlistStore } from "@/lib/store/cart";
import { buttonClass } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/cn";

export type CartableProduct = { id: string; slug: string; name: string; price: number; image: string; unitLabel?: string };

export function AddToCartButton({ product, quantity = 1, className, size = "sm", variant = "secondary", label = "أضف للسلة" }: {
  product: CartableProduct;
  quantity?: number;
  className?: string;
  size?: "sm" | "md" | "lg";
  variant?: "primary" | "secondary";
  label?: string;
}) {
  return (
    <button
      type="button"
      className={buttonClass(variant, size, className)}
      onClick={() => cart.add({ productId: product.id, slug: product.slug, name: product.name, unitPrice: product.price, image: product.image, unitLabel: product.unitLabel }, quantity)}
    >
      {label}
    </button>
  );
}

export function WishlistButton({ product, className }: { product: CartableProduct; className?: string }) {
  const saved = wishlistStore.useStore((s) => s.ids.includes(product.id));
  return (
    <button
      type="button"
      aria-pressed={saved}
      aria-label={saved ? `إزالة ${product.name} من المفضلة` : `أضف ${product.name} إلى المفضلة`}
      onClick={() => toggleWishlist(product)}
      className={cn("grid size-11 place-items-center rounded-full bg-ink/40 text-ivory backdrop-blur-sm transition-colors hover:bg-ink/70", saved && "text-gold", className)}
    >
      <Icon name="heart" size={18} fill={saved ? "currentColor" : "none"} />
    </button>
  );
}
