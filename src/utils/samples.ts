import { SamplePreset } from '../types';

export const SAMPLE_PRESETS: SamplePreset[] = [
  {
    id: 'ecommerce-order',
    name: 'E-Commerce Order',
    category: 'E-Commerce',
    description: 'Order with customer details, item arrays, pricing, and shipping status',
    json: JSON.stringify(
      {
        orderId: 'ORD-2026-9812',
        createdAt: '2026-08-19T08:30:00Z',
        status: 'processing',
        customer: {
          id: 'CUST-4091',
          name: 'Sarah Connor',
          email: 'sarah.c@example.com',
          phone: '+1-555-0199',
          isVip: true,
        },
        shippingAddress: {
          street: '742 Evergreen Terrace',
          city: 'Springfield',
          state: 'OR',
          postalCode: '97477',
          country: 'United States',
        },
        items: [
          {
            sku: 'PROD-NK-01',
            title: 'Mechanical Keychron Keyboard',
            quantity: 1,
            unitPrice: 129.99,
            tags: ['peripherals', 'hardware', 'rgb'],
            inStock: true,
          },
          {
            sku: 'PROD-CB-09',
            title: 'Braided Type-C Coiled Cable',
            quantity: 2,
            unitPrice: 19.5,
            tags: ['accessories'],
            inStock: true,
          },
        ],
        payment: {
          method: 'credit_card',
          transactionId: 'TXN-88201-XYZ',
          amount: 168.99,
          currency: 'USD',
          verified: true,
        },
        deliveryNotes: null,
      },
      null,
      2
    ),
  },
  {
    id: 'user-profile',
    name: 'User Profile & Settings',
    category: 'API',
    description: 'User identity, roles, permissions, theme preferences, and security logs',
    json: JSON.stringify(
      {
        userId: 'usr_98a72b4c',
        username: 'alex_dev',
        displayName: 'Alex Rodriguez',
        accountType: 'developer_pro',
        isActive: true,
        reputationScore: 4850.5,
        roles: ['admin', 'reviewer', 'maintainer'],
        preferences: {
          theme: 'dark',
          language: 'en-US',
          notifications: {
            email: true,
            push: false,
            sms: false,
            frequency: 'instant',
          },
          codeEditor: {
            tabSize: 2,
            fontFamily: 'Fira Code',
            lineNumbers: true,
          },
        },
        stats: {
          repositories: 34,
          followers: 1280,
          following: 192,
        },
      },
      null,
      2
    ),
  },
  {
    id: 'weather-api',
    name: 'Weather Forecast API',
    category: 'API',
    description: 'Meteorological telemetry with nested hourly forecasts and alerts',
    json: JSON.stringify(
      {
        location: {
          city: 'San Francisco',
          region: 'California',
          country: 'US',
          coordinates: {
            latitude: 37.7749,
            longitude: -122.4194,
          },
          timezone: 'America/Los_Angeles',
        },
        current: {
          tempC: 18.5,
          tempF: 65.3,
          condition: 'Partly Cloudy',
          humidity: 72,
          windKph: 14.2,
          uvIndex: 4,
          airQualityIndex: 28,
        },
        forecastDaily: [
          {
            date: '2026-08-19',
            maxTempC: 21.0,
            minTempC: 14.2,
            precipitationChance: 10,
            summary: 'Mild and sunny with afternoon fog',
          },
          {
            date: '2026-08-20',
            maxTempC: 23.5,
            minTempC: 15.0,
            precipitationChance: 5,
            summary: 'Clear skies',
          },
        ],
      },
      null,
      2
    ),
  },
  {
    id: 'broken-json-test',
    name: 'Malformed JSON (Test Auto-Fix)',
    category: 'Tests',
    description: 'Contains unquoted keys, single quotes, trailing commas & Python literals',
    json: `{
  name: 'JSON Repair Demo',
  version: 2.5,
  isActive: True,
  legacySetting: None,
  // Developer test comment
  tags: [
    'parser',
    'validator',
    'formatter',
  ],
  serverConfig: {
    host: 'localhost',
    port: 3000,
    debugMode: False,
  },
}`,
  },
];
