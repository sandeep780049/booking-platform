# Automated Payout System

This system automatically processes payouts to service providers (instructors, hotel owners) based on confirmed bookings.

## Features

- **Automated Cron Job**: Runs daily at 2 AM UTC to process payouts
- **PayPal Integration**: Sends payouts directly to providers' PayPal accounts
- **Multiple Booking Types**: Handles event bookings, hotel bookings, and item bookings
- **Safety Checks**: Only processes bookings confirmed more than 24 hours ago
- **Admin Controls**: Manual payout triggering and comprehensive monitoring

## How It Works

### 1. Cron Job Schedule
- Runs daily at 2 AM UTC
- Processes all confirmed bookings with completed payments
- Only processes bookings older than 24 hours (payment settlement period)

### 2. Payout Calculation
- **Platform Fee**: 20% retained by platform
- **Provider Payout**: 80% sent to service provider
- **Minimum Payout**: $10 USD minimum threshold

### 3. Supported Booking Types

#### Event Bookings
- Pays instructors assigned to adventure events
- If multiple instructors, amount is split proportionally
- Requires instructor to have linked PayPal account

#### Hotel Bookings
- Pays hotel owners for confirmed reservations
- Full 80% of booking amount sent to hotel owner
- Requires hotel owner to have linked PayPal account

#### Item Bookings
- Currently skipped (Item model doesn't have owner field)
- Can be enabled if Item model is updated with owner field

### 4. PayPal Requirements
- Service providers must link their PayPal account via the onboarding flow
- Must have valid `paypalPayerId` and `paypalEmail` in their user profile
- PayPal account must accept merchant payments

## API Endpoints

### Admin Endpoints (Authentication Required)

#### Trigger Manual Payout
```http
POST /api/transactions/payout/trigger
Authorization: Bearer <admin_token>
```

#### Get Payout History
```http
GET /api/transactions/payout/history?page=1&limit=20&status=SUCCESS
Authorization: Bearer <token>
```

#### Get Payout Statistics
```http
GET /api/transactions/payout/stats?startDate=2025-01-01&endDate=2025-01-31
Authorization: Bearer <admin_token>
```

#### System Status Check
```http
GET /api/transactions/system/status
Authorization: Bearer <admin_token>
```

## Database Models

### Payout Model
```javascript
{
  user: ObjectId,           // Service provider
  amount: Number,           // Payout amount (after platform fee)
  currency: String,         // Default: "USD"
  note: String,             // Description of payout
  batchId: String,          // PayPal batch ID
  itemId: String,           // Related booking IDs (comma-separated)
  status: String,           // QUEUED, SENT, SUCCESS, FAILED
  rawResponse: Mixed,       // PayPal API response
  createdAt: Date,
  updatedAt: Date
}
```

## Configuration

### Environment Variables
```env
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret
PAYPAL_API_BASE=https://api-m.sandbox.paypal.com  # or production URL
PAYPAL_PARTNER_ATTRIBUTION_ID=your_partner_attribution_id
```

### Cron Job Configuration
To modify the cron schedule, edit `transaction.controller.js`:

```javascript
// Current: Daily at 2 AM UTC
cron.schedule('0 2 * * *', async () => { ... });

// Examples:
// Every hour: '0 * * * *'
// Every 6 hours: '0 */6 * * *'
// Twice daily (2 AM and 2 PM): '0 2,14 * * *'
```

## Error Handling

### Common Issues

1. **Provider has no PayPal account**
   - Payout is skipped with warning log
   - Provider needs to complete PayPal onboarding

2. **Amount below minimum threshold**
   - Payout is skipped until accumulated amount reaches $10
   - Multiple bookings are batched together

3. **PayPal API errors**
   - Payout status set to FAILED
   - Raw error response stored for debugging
   - Admin can retry manually

### Monitoring

Check the system status regularly:
- Monitor payout success rates
- Check for failed payouts that need manual intervention
- Ensure cron job is running properly

## Security

- All payout operations require admin authentication
- Providers can only view their own payout history
- PayPal API credentials are environment-protected
- Minimum 24-hour delay prevents immediate payout of potentially fraudulent bookings

## Future Enhancements

1. **Email Notifications**: Notify providers when payouts are sent
2. **Item Owner Payouts**: Add when Item model includes owner field
3. **Multiple Payment Processors**: Support Stripe, bank transfers, etc.
4. **Automatic Retry**: Retry failed payouts with exponential backoff
5. **Currency Support**: Handle multiple currencies and conversions
6. **Payout Scheduling**: Allow providers to set preferred payout frequency
