
"use client";

import React, { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { addProduct } from "@/app/actions";
import AuthModal from "./AuthModal";
import { toast } from "sonner";

const AddProductforms = ({ user }) => {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      setShowAuthModal(true);
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("url", url);

      const result = await addProduct(formData);

      console.log("here");

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(
          result.message || "Product tracked successfully!");
        setUrl("");
      }

      setLoading(false);

      
    } catch (error) {
      console.error("Product submission error:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-2xl mx-auto"
      >
        <div className="flex flex-col sm:flex-row gap-2">
          <Input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Paste product URL (Amazon, Walmart, etc.)"
            className="h-12 text-base"
            required
            disabled={loading}
          />

          <Button
            type="submit"
            disabled={loading}
            size="lg"
            className="h-10 sm:h-12 w-31 shrink-0 whitespace-nowrap rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-semibold"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Adding...</span>
              </>
            ) : (
              <span>Track Price</span>
            )}
          </Button>
        </div>
      </form>

      <AuthModal
        isOpen={showAuthModal}
        onClose={setShowAuthModal}
      />
    </>
  );
};

export default AddProductforms;
