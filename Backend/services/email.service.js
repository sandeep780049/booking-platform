import nodemailer from "nodemailer";

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      secure: (process.env.SMTP_PORT) == 465, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD,
      },
      tls: {
        rejectUnauthorized: false, // Allow connections from cloud servers
      },
    });
  }

  /**
   * Send a generic email
   * @param {Object} options - Email options
   * @param {string|string[]} options.to - Recipient email(s)
   * @param {string} options.subject - Email subject
   * @param {string} options.html - HTML content
   * @param {string} options.text - Plain text content (optional)
   */
  async sendEmail({ to, subject, html, text }) {
    try {
      const mailOptions = {
        from:
          process.env.SMTP_EMAIL || '"Booking Platform" <noreply@booking.com>',
        to: Array.isArray(to) ? to.join(", ") : to,
        subject,
        html,
        text: text || html.replace(/<[^>]*>/g, ""), // Strip HTML for text version
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log("✅ Email sent successfully:", info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error("❌ Email sending failed:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send hotel booking confirmation emails
   * @param {Object} booking - Hotel booking object with populated fields
   */
  async sendHotelBookingConfirmation(booking) {
    try {
      const userEmail = booking.user.email;
      const hotelOwnerEmail = booking.hotel.owner?.email;

      // Email to user
      const userSubject = `Hotel Booking Confirmation - ${booking.hotel.name}`;
      const userHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; }
            .content { background-color: #f9f9f9; padding: 20px; margin-top: 20px; }
            .booking-details { background-color: white; padding: 15px; margin: 15px 0; border-left: 4px solid #4CAF50; }
            .detail-row { margin: 10px 0; }
            .label { font-weight: bold; color: #555; }
            .footer { text-align: center; margin-top: 20px; color: #777; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Booking Confirmed!</h1>
            </div>
            <div class="content">
              <p>Dear ${booking.user.name},</p>
              <p>Your hotel booking has been confirmed! Here are your booking details:</p>
              
              <div class="booking-details">
                <h3>📋 Booking Information</h3>
                <div class="detail-row">
                  <span class="label">Booking ID:</span> ${booking._id}
                </div>
                <div class="detail-row">
                  <span class="label">Hotel:</span> ${booking.hotel.name}
                </div>
                <div class="detail-row">
                  <span class="label">Location:</span> ${booking.hotel.fullAddress}
                </div>
                <div class="detail-row">
                  <span class="label">Check-in:</span> ${new Date(booking.checkInDate).toLocaleDateString()}
                </div>
                <div class="detail-row">
                  <span class="label">Check-out:</span> ${new Date(booking.checkOutDate).toLocaleDateString()}
                </div>
                <div class="detail-row">
                  <span class="label">Number of Rooms:</span> ${booking.numberOfRooms}
                </div>
                <div class="detail-row">
                  <span class="label">Guests:</span> ${booking.guests}
                </div>
                ${booking.specialRequests
          ? `
                <div class="detail-row">
                  <span class="label">Special Requests:</span> ${booking.specialRequests}
                </div>
                `
          : ""
        }
                <div class="detail-row">
                  <span class="label">Total Amount:</span> £${booking.amount.toFixed(2)}
                </div>
                <div class="detail-row">
                  <span class="label">Payment Status:</span> ✅ Completed
                </div>
              </div>
              
              <p>We look forward to your stay! If you have any questions, please contact the hotel directly.</p>
            </div>
            <div class="footer">
              <p>This is an automated message. Please do not reply to this email.</p>
            </div>
          </div>
        </body>
        </html>
      `;

      await this.sendEmail({
        to: userEmail,
        subject: userSubject,
        html: userHtml,
      });

      // Email to hotel owner
      if (hotelOwnerEmail) {
        const ownerSubject = `New Booking Received - ${booking.hotel.name}`;
        const ownerHtml = `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background-color: #2196F3; color: white; padding: 20px; text-align: center; }
              .content { background-color: #f9f9f9; padding: 20px; margin-top: 20px; }
              .booking-details { background-color: white; padding: 15px; margin: 15px 0; border-left: 4px solid #2196F3; }
              .detail-row { margin: 10px 0; }
              .label { font-weight: bold; color: #555; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🏨 New Booking Received</h1>
              </div>
              <div class="content">
                <p>You have received a new booking for ${booking.hotel.name}.</p>
                
                <div class="booking-details">
                  <h3>Guest Information</h3>
                  <div class="detail-row">
                    <span class="label">Guest Name:</span> ${booking.user.name}
                  </div>
                  <div class="detail-row">
                    <span class="label">Email:</span> ${booking.user.email}
                  </div>
                  <div class="detail-row">
                    <span class="label">Phone:</span> ${booking.user.phoneNumber || "N/A"}
                  </div>
                  <div class="detail-row">
                    <span class="label">Check-in:</span> ${new Date(booking.checkInDate).toLocaleDateString()}
                  </div>
                  <div class="detail-row">
                    <span class="label">Check-out:</span> ${new Date(booking.checkOutDate).toLocaleDateString()}
                  </div>
                  <div class="detail-row">
                    <span class="label">Rooms:</span> ${booking.numberOfRooms}
                  </div>
                  <div class="detail-row">
                    <span class="label">Guests:</span> ${booking.guests}
                  </div>
                  ${booking.specialRequests
            ? `
                  <div class="detail-row">
                    <span class="label">Special Requests:</span> ${booking.specialRequests}
                  </div>
                  `
            : ""
          }
                  <div class="detail-row">
                    <span class="label">Amount:</span> £${booking.amount.toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          </body>
          </html>
        `;

        await this.sendEmail({
          to: hotelOwnerEmail,
          subject: ownerSubject,
          html: ownerHtml,
        });
      }

      return { success: true };
    } catch (error) {
      console.error("Error sending hotel booking confirmation:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send event booking confirmation emails
   * @param {Object} booking - Event booking object with populated fields
   */
  async sendEventBookingConfirmation(booking) {
    try {
      const userEmail = booking.user.email;

      // Email to user
      const userSubject = `Event Booking Confirmation - ${booking.event.title}`;
      const userHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #FF5722; color: white; padding: 20px; text-align: center; }
            .content { background-color: #f9f9f9; padding: 20px; margin-top: 20px; }
            .booking-details { background-color: white; padding: 15px; margin: 15px 0; border-left: 4px solid #FF5722; }
            .detail-row { margin: 10px 0; }
            .label { font-weight: bold; color: #555; }
            .footer { text-align: center; margin-top: 20px; color: #777; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎊 Event Booking Confirmed!</h1>
            </div>
            <div class="content">
              <p>Dear ${booking.user.name},</p>
              <p>Your event booking has been confirmed! Get ready for an amazing experience!</p>
              
              <div class="booking-details">
                <h3>📅 Event Details</h3>
                <div class="detail-row">
                  <span class="label">Booking ID:</span> ${booking._id}
                </div>
                <div class="detail-row">
                  <span class="label">Event:</span> ${booking.event.title}
                </div>
                <div class="detail-row">
                  <span class="label">Date:</span> ${new Date(booking.event.date).toLocaleDateString()}
                </div>
                <div class="detail-row">
                  <span class="label">Time:</span> ${booking.event.startTime} - ${booking.event.endTime}
                </div>
                <div class="detail-row">
                  <span class="label">Location:</span> ${booking.event.location}, ${booking.event.city}, ${booking.event.country}
                </div>
                <div class="detail-row">
                  <span class="label">Participants:</span> ${booking.participants}
                </div>
                <div class="detail-row">
                  <span class="label">Contact Email:</span> ${booking.contactInfo.email}
                </div>
                <div class="detail-row">
                  <span class="label">Contact Phone:</span> ${booking.contactInfo.phone}
                </div>
                <div class="detail-row">
                  <span class="label">Total Amount:</span> £${booking.amount.toFixed(2)}
                </div>
                <div class="detail-row">
                  <span class="label">Payment Status:</span> ✅ Completed
                </div>
              </div>
              
              <p>We're excited to see you at the event!</p>
            </div>
            <div class="footer">
              <p>This is an automated message. Please do not reply to this email.</p>
            </div>
          </div>
        </body>
        </html>
      `;

      await this.sendEmail({
        to: userEmail,
        subject: userSubject,
        html: userHtml,
      });

      // Email to instructors
      if (
        booking.adventureInstructors &&
        booking.adventureInstructors.length > 0
      ) {
        const instructorEmails = booking.adventureInstructors
          .map((ai) => ai.instructor?.email)
          .filter((email) => email);

        if (instructorEmails.length > 0) {
          const instructorSubject = `New Event Booking - ${booking.event.title}`;
          const instructorHtml = `
            <!DOCTYPE html>
            <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background-color: #9C27B0; color: white; padding: 20px; text-align: center; }
                .content { background-color: #f9f9f9; padding: 20px; margin-top: 20px; }
                .booking-details { background-color: white; padding: 15px; margin: 15px 0; border-left: 4px solid #9C27B0; }
                .detail-row { margin: 10px 0; }
                .label { font-weight: bold; color: #555; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>📢 New Event Booking</h1>
                </div>
                <div class="content">
                  <p>You have been assigned to a new event booking.</p>
                  
                  <div class="booking-details">
                    <h3>Event Information</h3>
                    <div class="detail-row">
                      <span class="label">Event:</span> ${booking.event.title}
                    </div>
                    <div class="detail-row">
                      <span class="label">Date:</span> ${new Date(booking.event.date).toLocaleDateString()}
                    </div>
                    <div class="detail-row">
                      <span class="label">Time:</span> ${booking.event.startTime} - ${booking.event.endTime}
                    </div>
                    <div class="detail-row">
                      <span class="label">Participants:</span> ${booking.participants}
                    </div>
                    <div class="detail-row">
                      <span class="label">Participant Name:</span> ${booking.user.name}
                    </div>
                    <div class="detail-row">
                      <span class="label">Contact:</span> ${booking.contactInfo.email} / ${booking.contactInfo.phone}
                    </div>
                  </div>
                </div>
              </div>
            </body>
            </html>
          `;

          await this.sendEmail({
            to: instructorEmails,
            subject: instructorSubject,
            html: instructorHtml,
          });
        }
      }

      return { success: true };
    } catch (error) {
      console.error("Error sending event booking confirmation:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send session booking confirmation emails
   * @param {Object} booking - Session booking object with populated fields
   */
  async sendSessionBookingConfirmation(booking) {
    try {
      const userEmail = booking.user.email;
      const instructorEmail = booking.session?.instructorId?.email;

      // Email to user
      const userSubject = `Session Booking Confirmation - ${booking.session?.adventureId?.name || "Adventure Session"}`;
      const userHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #00BCD4; color: white; padding: 20px; text-align: center; }
            .content { background-color: #f9f9f9; padding: 20px; margin-top: 20px; }
            .booking-details { background-color: white; padding: 15px; margin: 15px 0; border-left: 4px solid #00BCD4; }
            .detail-row { margin: 10px 0; }
            .label { font-weight: bold; color: #555; }
            .footer { text-align: center; margin-top: 20px; color: #777; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>⛰️ Session Booking Confirmed!</h1>
            </div>
            <div class="content">
              <p>Dear ${booking.user.name},</p>
              <p>Your adventure session has been confirmed!</p>
              
              <div class="booking-details">
                <h3>🎯 Session Details</h3>
                <div class="detail-row">
                  <span class="label">Booking ID:</span> ${booking._id}
                </div>
                ${booking.session?.adventureId?.name
          ? `
                <div class="detail-row">
                  <span class="label">Adventure:</span> ${booking.session.adventureId.name}
                </div>
                `
          : ""
        }
                <div class="detail-row">
                  <span class="label">Session Date:</span> ${new Date(booking.session?.startTime).toLocaleDateString()}
                </div>
                  <div class="detail-row">
                    <span class="label">Start Time:</span> ${booking.session?.startTime ? new Date(booking.session.startTime).toLocaleTimeString() : "N/A"}
                  </div>
                ${booking.session?.instructorId?.name
          ? `
                <div class="detail-row">
                  <span class="label">Instructor:</span> ${booking.session.instructorId.name}
                </div>
                `
          : ""
        }
                ${booking.session?.location
          ? `
                <div class="detail-row">
                  <span class="label">Location:</span> ${booking.session.location.name || "TBD"}
                </div>
                `
          : ""
        }
                <div class="detail-row">
                  <span class="label">Total Amount:</span> £${(booking.session.price * (booking.groupMember ? booking.groupMember.length + 1 : 1)).toFixed(2)}
                </div>
                <div class="detail-row">
                  <span class="label">Payment Status:</span> ✅ Completed
                </div>
              </div>
              
              <p>Get ready for an amazing adventure! Your instructor will contact you with additional details.</p>
            </div>
            <div class="footer">
              <p>This is an automated message. Please do not reply to this email.</p>
            </div>
          </div>
        </body>
        </html>
      `;
      await this.sendEmail({
        to: userEmail,
        subject: userSubject,
        html: userHtml,
      });

      // Email to instructor
      if (instructorEmail) {
        const instructorSubject = `New Session Booking - ${booking.session?.adventureId?.name || "Adventure"}`;
        const instructorHtml = `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background-color: #673AB7; color: white; padding: 20px; text-align: center; }
              .content { background-color: #f9f9f9; padding: 20px; margin-top: 20px; }
              .booking-details { background-color: white; padding: 15px; margin: 15px 0; border-left: 4px solid #673AB7; }
              .detail-row { margin: 10px 0; }
              .label { font-weight: bold; color: #555; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🎓 New Session Booking</h1>
              </div>
              <div class="content">
                <p>You have a new session booking!</p>
                
                <div class="booking-details">
                  <h3>Participant Information</h3>
                  <div class="detail-row">
                    <span class="label">Participant:</span> ${booking.user.name}
                  </div>
                  <div class="detail-row">
                    <span class="label">Email:</span> ${booking.user.email}
                  </div>
                  <div class="detail-row">
                    <span class="label">Phone:</span> ${booking.user.phoneNumber || "N/A"}
                  </div>
                  <div class="detail-row">
                    <span class="label">Session Date:</span> ${new Date(booking.session?.startTime).toLocaleDateString()}
                  </div>
                  <div class="detail-row">
                    <span class="label">Start Time:</span> ${new Date(booking.session?.startTime).toLocaleTimeString()}
                  </div>
                  ${booking.groupMember && booking.groupMember.length > 0
            ? `
                  <div class="detail-row">
                    <span class="label">Group Size:</span> ${booking.groupMember.length + 1} people
                  </div>
                  `
            : ""
          }
                </div>
              </div>
            </div>
          </body>
          </html>
        `;

        await this.sendEmail({
          to: instructorEmail,
          subject: instructorSubject,
          html: instructorHtml,
        });
      }

      return { success: true };
    } catch (error) {
      console.error("Error sending session booking confirmation:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send item booking confirmation emails
   * @param {Object} booking - Item booking object with populated fields
   */
  async sendItemBookingConfirmation(booking) {
    try {
      const userEmail = booking.user.email;

      // Email to user
      const itemsList = booking.items
        .map((item) => {
          const itemName = item.item?.name || "Item";
          const quantity = item.quantity;
          const isPurchase = item.purchase;
          const rentalPeriod = item.rentalPeriod;

          let details = `${itemName} (Qty: ${quantity})`;
          if (isPurchase) {
            details += " - Purchase";
          } else if (rentalPeriod) {
            details += ` - Rental: ${new Date(rentalPeriod.startDate).toLocaleDateString()} to ${new Date(rentalPeriod.endDate).toLocaleDateString()}`;
          }
          return details;
        })
        .join("<br>");

      const userSubject = `Item Booking Confirmation`;
      const userHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #FFC107; color: white; padding: 20px; text-align: center; }
            .content { background-color: #f9f9f9; padding: 20px; margin-top: 20px; }
            .booking-details { background-color: white; padding: 15px; margin: 15px 0; border-left: 4px solid #FFC107; }
            .detail-row { margin: 10px 0; }
            .label { font-weight: bold; color: #555; }
            .footer { text-align: center; margin-top: 20px; color: #777; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🛒 Item Booking Confirmed!</h1>
            </div>
            <div class="content">
              <p>Dear ${booking.user.name},</p>
              <p>Your item booking has been confirmed!</p>
              
              <div class="booking-details">
                <h3>📦 Booking Details</h3>
                <div class="detail-row">
                  <span class="label">Booking ID:</span> ${booking._id}
                </div>
                <div class="detail-row">
                  <span class="label">Items:</span><br>${itemsList}
                </div>
                <div class="detail-row">
                  <span class="label">Total Amount:</span> £${booking.amount?.toFixed(2)}
                </div>
                <div class="detail-row">
                  <span class="label">Payment Status:</span> ✅ Completed
                </div>
                <div class="detail-row">
                  <span class="label">Booking Date:</span> ${new Date(booking.bookingDate).toLocaleDateString()}
                </div>
              </div>
              
              <p>Your items will be prepared for pickup/delivery. We'll contact you with further details.</p>
            </div>
            <div class="footer">
              <p>This is an automated message. Please do not reply to this email.</p>
            </div>
          </div>
        </body>
        </html>
      `;

      await this.sendEmail({
        to: userEmail,
        subject: userSubject,
        html: userHtml,
      });

      // Email to item owners (if owner field exists)
      const uniqueOwners = new Map();
      booking.items.forEach((item) => {
        if (item.item?.owner?.email) {
          const ownerEmail = item.item.owner.email;
          if (!uniqueOwners.has(ownerEmail)) {
            uniqueOwners.set(ownerEmail, {
              email: ownerEmail,
              name: item.item.owner.name,
              items: [],
            });
          }
          uniqueOwners.get(ownerEmail).items.push(item);
        }
      });

      for (const [email, ownerData] of uniqueOwners) {
        const ownerItemsList = ownerData.items
          .map((item) => {
            const itemName = item.item?.name || "Item";
            const quantity = item.quantity;
            const isPurchase = item.purchase;
            const rentalPeriod = item.rentalPeriod;

            let details = `${itemName} (Qty: ${quantity})`;
            if (isPurchase) {
              details += " - Purchase";
            } else if (rentalPeriod) {
              details += ` - Rental: ${new Date(rentalPeriod.startDate).toLocaleDateString()} to ${new Date(rentalPeriod.endDate).toLocaleDateString()}`;
            }
            return details;
          })
          .join("<br>");

        const ownerSubject = `New Item Booking Received`;
        const ownerHtml = `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background-color: #FF9800; color: white; padding: 20px; text-align: center; }
              .content { background-color: #f9f9f9; padding: 20px; margin-top: 20px; }
              .booking-details { background-color: white; padding: 15px; margin: 15px 0; border-left: 4px solid #FF9800; }
              .detail-row { margin: 10px 0; }
              .label { font-weight: bold; color: #555; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>📦 New Item Booking</h1>
              </div>
              <div class="content">
                <p>You have received a new booking for your items.</p>
                
                <div class="booking-details">
                  <h3>Customer Information</h3>
                  <div class="detail-row">
                    <span class="label">Customer:</span> ${booking.user.name}
                  </div>
                  <div class="detail-row">
                    <span class="label">Email:</span> ${booking.user.email}
                  </div>
                  <div class="detail-row">
                    <span class="label">Phone:</span> ${booking.user.phoneNumber || "N/A"}
                  </div>
                  <div class="detail-row">
                    <span class="label">Items Booked:</span><br>${ownerItemsList}
                  </div>
                  <div class="detail-row">
                    <span class="label">Booking Date:</span> ${new Date(booking.bookingDate).toLocaleDateString()}
                  </div>
                </div>
                
                <p>Please prepare the items for the customer.</p>
              </div>
            </div>
          </body>
          </html>
        `;

        await this.sendEmail({
          to: email,
          subject: ownerSubject,
          html: ownerHtml,
        });
      }

      return { success: true };
    } catch (error) {
      console.error("Error sending item booking confirmation:", error);
      return { success: false, error: error.message };
    }
  }
}

export default new EmailService();
