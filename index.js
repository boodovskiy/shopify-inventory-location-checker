const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

const corsOption = {
    origin: process.env.SHOPIFY_SITE_URL,
    optionsSuccessStatus: 200,
}
app.use(cors(corsOption));

const SHOPIFY_API_URL = `https://${process.env.SHOPIFY_STORE_DOMAIN}/admin/api/2025-01/`;
const SHOPIFY_ACCESS_TOKEN  = process.env.SHOPIFY_ACCESS_TOKEN;

app.get('/inventory-levels', async(req, res) => {
    const { variant_id, location_id } = req.query;

    if (!variant_id || !location_id) {
        return res.status(400).json({ error: 'Missing Variant or Location ID parameters.' });
    }

    try {
        // Step 2: Get inventory item is using variant_id
        const variantResponse = await fetch(`${SHOPIFY_API_URL}variants/${variant_id}.json`,{
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'X-Shopify-Access-Token': SHOPIFY_ACCESS_TOKEN
            }
        });

        if (!variantResponse.ok) {
            const errorText = await variantResponse.text();
            console.error(`Shopify API Error (Variant): ${variantResponse.status} ${variantResponse.statusText}`, errorText);
            return res.status(variantResponse.status).json({ error: `Shopify API Error: ${variantResponse.statusText}` });
        }

        const variantData = await variantResponse.json();
        const inventory_item_id = variantData.variant.inventory_item_id;

        // Step 2: Get inventory levels using inventory_item_id and location_id
        const inventoryResponse = await fetch(`${SHOPIFY_API_URL}inventory_levels.json?inventory_item_ids=${inventory_item_id}&location_ids=${location_id}`,{
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'X-Shopify-Access-Token': SHOPIFY_ACCESS_TOKEN
            }
        });

        if (!inventoryResponse.ok) {
            const errorText = await inventoryResponse.text();
            console.error(`Shopify API Error (Inventory): ${inventoryResponse.status} ${inventoryResponse.statusText}`, errorText);
            return res.status(inventoryResponse.status).json({ error: `Shopify API Error: ${inventoryResponse.statusText}` });
        }

        const inventoryData = await inventoryResponse.json();
        res.json(inventoryData);
    } catch (error) {
        console.error('Unexpected Error:', error.message);
        res.status(500).json({ error: error.message });
    }

});


app.listen(port, () => {
   console.log(`Server is running on port ${port}`);
});
