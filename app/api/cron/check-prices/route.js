
import { scrapeProduct } from "@/lib/firecrawl";
import { sendPriceDropAlert } from "@/lib/email";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function GET() {
    return NextResponse.json({
        message: "Price check endpoint is working. Use POST to trigger.",
    });
}

export async function POST(request) {
    try {
        // Verify cron secret
        const authHeader = request.headers.get("authorization");
        const cronSecret = process.env.CRON_SECRET;

        if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        // Create Supabase admin client
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.SUPABASE_SERVICE_ROLE_KEY,
            {
                auth: {
                    persistSession: false,
                    autoRefreshToken: false,
                },
            }
        );

        // Fetch all tracked products
        const { data: products, error: productsError } = await supabase
            .from("products")
            .select("*");

        if (productsError) {
            throw productsError;
        }

        console.log(`Found ${products.length} products to check`);

        const results = {
            total: products.length,
            updated: 0,
            failed: 0,
            priceChanges: 0,
            alertsSent: 0,
        };

        // Check each product
        for (const product of products) {
            try {
                const productData = await scrapeProduct(product.url);

                const newPrice = Number(productData.currentPrice);
                const oldPrice = Number(product.current_price);

                // Validate prices
                if (
                    !Number.isFinite(newPrice) ||
                    newPrice <= 0 ||
                    !Number.isFinite(oldPrice) ||
                    oldPrice <= 0
                ) {
                    console.error(`Invalid price for product ${product.id}`);
                    results.failed++;
                    continue;
                }

                const currency =
                    productData.currencyCode || product.currency;

                const updatedProduct = {
                    ...product,
                    currency,
                    name: productData.productName || product.name,
                    image_url:
                        productData.productImageUrl || product.image_url,
                };

                // Update product details
                const { error: updateError } = await supabase
                    .from("products")
                    .update({
                        current_price: newPrice,
                        currency,
                        name: updatedProduct.name,
                        image_url: updatedProduct.image_url,
                        updated_at: new Date().toISOString(),
                    })
                    .eq("id", product.id);

                if (updateError) {
                    throw updateError;
                }

                // Record price changes
                if (oldPrice !== newPrice) {
                    const { error: historyError } = await supabase
                        .from("price_history")
                        .insert({
                            product_id: product.id,
                            price: newPrice,
                            currency,
                        });

                    if (historyError) {
                        throw historyError;
                    }

                    results.priceChanges++;

                    // Send email only when price decreases
                    if (newPrice < oldPrice) {
                        const {
                            data: { user },
                            error: userError,
                        } = await supabase.auth.admin.getUserById(
                            product.user_id
                        );

                        if (userError) {
                            console.error(
                                "Could not find user:",
                                userError
                            );
                        } else if (user?.email) {
                            const emailResult = await sendPriceDropAlert(
                                user.email,
                                updatedProduct,
                                oldPrice,
                                newPrice
                            );

                            if (emailResult.success) {
                                results.alertsSent++;
                            } else {
                                console.error(
                                    "Email failed:",
                                    emailResult.error
                                );
                            }
                        }
                    }
                }

                results.updated++;

            } catch (error) {
                console.error(
                    `Error processing product ${product.id}:`,
                    error
                );
                results.failed++;
            }
        }

        return NextResponse.json({
            success: true,
            message: "Price check completed",
            results,
        });

    } catch (error) {
        console.error("Cron job error:", error);

        return NextResponse.json(
            { error: error.message || "Cron job failed" },
            { status: 500 }
        );
    }
}
