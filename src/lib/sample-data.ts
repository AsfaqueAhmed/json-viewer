export interface SampleItem {
  id: string;
  name: string;
  category: string;
  description: string;
  data: unknown;
}

export const SAMPLE_DATASETS: SampleItem[] = [
  {
    id: "api-response",
    name: "REST API (Users & Orders)",
    category: "Full API",
    description: "Complex nested response with users, pagination, order items, timestamps, and metadata.",
    data: {
      status: "success",
      code: 200,
      timestamp: "2026-09-02T00:20:00Z",
      pagination: {
        page: 1,
        per_page: 20,
        total_records: 1240,
        total_pages: 62,
        has_next: true,
      },
      data: {
        users: [
          {
            id: "usr_8f92ab10",
            username: "alex_dev",
            email: "alex.chen@innovate.tech",
            profile: {
              first_name: "Alex",
              last_name: "Chen",
              avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb",
              role: "Senior Staff Engineer",
              verified: true,
              rating: 4.95,
              location: {
                city: "San Francisco",
                state: "CA",
                country: "United States",
                coordinates: {
                  latitude: 37.7749,
                  longitude: -122.4194,
                },
              },
            },
            preferences: {
              theme: "dark",
              notifications: {
                email: true,
                push: false,
                sms: false,
              },
              tags: ["typescript", "rust", "nextjs", "kubernetes"],
            },
            recent_orders: [
              {
                order_id: "ord_99014",
                date: "2026-08-28T14:30:00Z",
                status: "DELIVERED",
                total_usd: 249.99,
                items: [
                  { sku: "KB-MECH-01", name: "Custom Mechanical Keyboard 75%", qty: 1, price: 189.99 },
                  { sku: "CBL-COIL-BLK", name: "Coiled Aviator Cable (USB-C)", qty: 2, price: 30.0 },
                ],
                tracking: {
                  carrier: "FedEx Express",
                  number: "983210491823",
                  estimated_delivery: "2026-08-30",
                },
              },
              {
                order_id: "ord_99088",
                date: "2026-09-01T09:15:00Z",
                status: "PROCESSING",
                total_usd: 129.5,
                items: [
                  { sku: "DESK-PAD-XL", name: "Merino Wool Desk Mat XL", qty: 1, price: 89.5 },
                  { sku: "WRIST-REST-WD", name: "Walnut Wood Wrist Rest", qty: 1, price: 40.0 },
                ],
                tracking: null,
              },
            ],
          },
          {
            id: "usr_3c71df99",
            username: "sarah_ui",
            email: "sarah.jenkins@designsystems.io",
            profile: {
              first_name: "Sarah",
              last_name: "Jenkins",
              avatar_url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330",
              role: "Design Lead",
              verified: true,
              rating: 5.0,
              location: {
                city: "London",
                state: "Greater London",
                country: "United Kingdom",
                coordinates: {
                  latitude: 51.5074,
                  longitude: -0.1278,
                },
              },
            },
            preferences: {
              theme: "system",
              notifications: {
                email: true,
                push: true,
                sms: true,
              },
              tags: ["figma", "design-tokens", "accessibility", "css"],
            },
            recent_orders: [],
          },
        ],
        system_stats: {
          uptime_seconds: 489201,
          active_connections: 3412,
          server_load: [0.15, 0.22, 0.18],
          memory: {
            used_mb: 4120,
            free_mb: 12264,
            total_mb: 16384,
          },
        },
      },
    },
  },
  {
    id: "ecommerce-catalog",
    name: "E-Commerce Catalog",
    category: "Products",
    description: "Array of product catalog items with ratings, pricing, badges, and inventory.",
    data: [
      {
        id: "prod_001",
        title: "Pro Ultra Wireless Headphones",
        brand: "AcousticLab",
        category: "Audio",
        price: 349.0,
        currency: "USD",
        in_stock: true,
        inventory_count: 42,
        features: ["Active Noise Cancelling", "60hr Battery Life", "Spatial Audio", "Multipoint Bluetooth 5.4"],
        specs: {
          weight_grams: 250,
          driver_size_mm: 40,
          frequency_response: "10Hz - 40kHz",
          charging_port: "USB-C",
        },
        reviews: {
          average_rating: 4.8,
          total_reviews: 128,
        },
      },
      {
        id: "prod_002",
        title: "4K OLED Curved Gaming Monitor 34\"",
        brand: "VisionTech",
        category: "Displays",
        price: 899.99,
        currency: "USD",
        in_stock: true,
        inventory_count: 14,
        features: ["240Hz Refresh Rate", "0.03ms Response Time", "HDR True Black 400", "99% DCI-P3"],
        specs: {
          weight_grams: 7800,
          resolution: "3440x1440",
          aspect_ratio: "21:9",
          ports: ["HDMI 2.1 x2", "DP 1.4 x1", "USB-C 90W PD"],
        },
        reviews: {
          average_rating: 4.9,
          total_reviews: 310,
        },
      },
      {
        id: "prod_003",
        title: "Ergonomic Mesh Task Chair",
        brand: "ErgoForm",
        category: "Furniture",
        price: 549.0,
        currency: "USD",
        in_stock: false,
        inventory_count: 0,
        features: ["Dynamic Lumbar Support", "4D Armrests", "Breathable Italian Mesh", "135° Recline"],
        specs: {
          weight_grams: 18500,
          max_load_kg: 150,
          warranty_years: 10,
        },
        reviews: {
          average_rating: 4.6,
          total_reviews: 89,
        },
      },
    ],
  },
  {
    id: "geojson-sample",
    name: "GeoJSON Map Features",
    category: "Geospatial",
    description: "Standard GeoJSON FeatureCollection with points, polygons, and metadata.",
    data: {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          id: "node_01",
          geometry: {
            type: "Point",
            coordinates: [-122.4194, 37.7749],
          },
          properties: {
            name: "San Francisco Tech Hub",
            amenity: "Co-working Space",
            capacity: 350,
            wifi_speed_mbps: 1000,
            verified: true,
          },
        },
        {
          type: "Feature",
          id: "poly_02",
          geometry: {
            type: "Polygon",
            coordinates: [
              [
                [-122.425, 37.77],
                [-122.41, 37.77],
                [-122.41, 37.78],
                [-122.425, 37.78],
                [-122.425, 37.77],
              ],
            ],
          },
          properties: {
            name: "Civic Center Innovation Zone",
            zone_code: "Z-104",
            active_permits: 18,
          },
        },
      ],
    },
  },
  {
    id: "malformed-json",
    name: "Malformed / Broken JSON (Test Repair)",
    category: "Broken Sample",
    description: "Real-world broken JSON with unquoted keys, single quotes, trailing commas, comments, and missing brackets to test auto-repair.",
    data: `// Broken JSON Sample for Testing Auto-Repair
{
  name: 'JSON Repair Demo',
  description: "Testing unquoted keys, single quotes, comments, trailing commas",
  /* Configuration settings */
  settings: {
    enabled: True,
    maxRetries: 3,
    endpoints: [
      'https://api.one.io',
      'https://api.two.io',
    ], // Trailing comma here
  },
  nested: {
    status: undefined,
    count: NaN,
  }
}`,
  },
  {
    id: "user-schema",
    name: "JSON Schema (Draft-07)",
    category: "Schema",
    description: "Standard JSON Schema for validating user profiles and addresses.",
    data: {
      $schema: "http://json-schema.org/draft-07/schema#",
      title: "UserProfile",
      type: "object",
      required: ["id", "username", "email", "age"],
      properties: {
        id: {
          type: "string",
          pattern: "^usr_[a-f0-9]{8}$",
        },
        username: {
          type: "string",
          minLength: 3,
          maxLength: 30,
        },
        email: {
          type: "string",
          format: "email",
        },
        age: {
          type: "integer",
          minimum: 18,
          maximum: 120,
        },
        website: {
          type: "string",
          format: "uri",
        },
        roles: {
          type: "array",
          items: {
            type: "string",
            enum: ["admin", "member", "editor", "viewer"],
          },
          minItems: 1,
          uniqueItems: true,
        },
      },
    },
  },
  {
    id: "diff-sample-v1",
    name: "Diff Baseline (API v1)",
    category: "Comparer",
    description: "Version 1 of an API config to compare against Version 2.",
    data: {
      api_version: "1.2.0",
      environment: "staging",
      debug: true,
      rate_limit: 1000,
      features: {
        oauth2: true,
        legacy_auth: true,
        webhooks: false,
      },
      servers: [
        { host: "us-east-1.app.internal", port: 8080, priority: 1 },
        { host: "us-west-2.app.internal", port: 8080, priority: 2 },
      ],
      deprecated_keys: {
        old_token: "secret_12345",
      },
    },
  },
  {
    id: "diff-sample-v2",
    name: "Diff Target (API v2)",
    category: "Comparer",
    description: "Version 2 of an API config to compare against Version 1.",
    data: {
      api_version: "2.0.0",
      environment: "production",
      debug: false,
      rate_limit: 5000,
      timeout_seconds: 30,
      features: {
        oauth2: true,
        legacy_auth: false,
        webhooks: true,
        graphql_v2: true,
      },
      servers: [
        { host: "us-east-1.app.internal", port: 443, priority: 1, ssl: true },
        { host: "eu-central-1.app.internal", port: 443, priority: 2, ssl: true },
      ],
    },
  },
];
