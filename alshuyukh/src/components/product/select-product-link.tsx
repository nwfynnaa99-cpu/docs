"use client";

import Link from "next/link";
import type { ComponentProps } from "react";
import { track } from "@/lib/analytics/track";

export function SelectProductLink({ product, listName, ...props }: ComponentProps<typeof Link> & {
  product: { id: string; name: string; price: number; index?: number };
  listName?: string;
}) {
  return (
    <Link
      {...props}
      onClick={(e) => {
        track("select_product", { item_list_name: listName, items: [{ item_id: product.id, item_name: product.name, price: product.price / 100, index: product.index }] });
        props.onClick?.(e);
      }}
    />
  );
}
