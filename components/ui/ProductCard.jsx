
"use client";

import { deleteProduct } from "@/app/actions";
import React, { useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardFooter, CardHeader } from "./card";
import {
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Trash2,
  TrendingDown,
} from "lucide-react";
import { Badge } from "./badge";
import { Button } from "./button";
import PriceChart from "@/lib/components/PriceChart";

const ProductCard = ({ product }) => {
  const [showChart, setShowChart] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Remove this product from tracking?")) return;

    setDeleting(true);

    try {
      const result = await deleteProduct(product.id);

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Product deleted successfully!");
      }
    } catch (error) {
      toast.error("Failed to delete product");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Card className="w-full overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
      <CardHeader className="pb-4">
        <div className="flex items-start gap-4">
          {product.image_url && (
            <img
              src={product.image_url}
              alt={product.name}
              className="h-20 w-20 shrink-0 rounded-xl border border-gray-100 bg-gray-50 object-cover"
            />
          )}

          <div className="min-w-0 flex-1">
            <h3 className="mb-2 line-clamp-2 text-sm font-semibold leading-relaxed text-gray-900">
              {product.name}
            </h3>

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-2xl font-bold tracking-tight text-orange-600">
                {product.currency || "INR"}{" "}
                {Number(product.current_price).toLocaleString("en-IN")}
              </span>

              <Badge variant="secondary" className="gap-1 rounded-full">
                <TrendingDown className="h-3 w-3" />
                Tracking
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pb-4">
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowChart(!showChart)}
            className="gap-1 rounded-full"
          >
            {showChart ? (
              <>
                <ChevronUp className="h-4 w-4" />
                Hide Chart
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4" />
                Show Chart
              </>
            )}
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="gap-1 rounded-full"
            onClick={() =>
              window.open(
                product.url,
                "_blank",
                "noopener,noreferrer"
              )
            }
          >
            <ExternalLink className="h-4 w-4" />
            View Product
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            disabled={deleting}
            className="gap-1 rounded-full text-red-600 hover:bg-red-50 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
            {deleting ? "Removing..." : "Remove"}
          </Button>
        </div>
      </CardContent>

      {showChart && (
        <CardFooter className="border-t border-gray-100 bg-gray-50/70 p-4">
          <PriceChart productId={product.id} />
        </CardFooter>
      )}
    </Card>
  );
};

export default ProductCard;
