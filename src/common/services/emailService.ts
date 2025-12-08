import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

import { env } from "@/common/utils/envConfig";
import { logger } from "@/server";

// Create SES client (only if configured)
let sesClient: SESClient | null = null;

if (env.AWS_REGION) {
	sesClient = new SESClient({
		region: env.AWS_REGION,
	});
}

export interface InvitationEmailData {
	toEmail: string;
	shelterName: string;
	roleName: string;
	inviterName: string;
}

export class EmailService {
	/**
	 * Send invitation email to new shelter member
	 */
	async sendInvitationEmail(data: InvitationEmailData): Promise<void> {
		if (!sesClient) {
			logger.warn("AWS SES not configured. Email not sent.");
			return;
		}

		if (!env.AWS_SES_FROM_EMAIL) {
			logger.warn("AWS_SES_FROM_EMAIL not configured. Email not sent.");
			return;
		}

		const subject = `Invitation to join ${data.shelterName}`;
		const htmlBody = this.generateInvitationEmailHtml(data);
		const textBody = this.generateInvitationEmailText(data);

		try {
			const command = new SendEmailCommand({
				Source: env.AWS_SES_FROM_EMAIL,
				Destination: {
					ToAddresses: [data.toEmail],
				},
				Message: {
					Subject: {
						Data: subject,
						Charset: "UTF-8",
					},
					Body: {
						Html: {
							Data: htmlBody,
							Charset: "UTF-8",
						},
						Text: {
							Data: textBody,
							Charset: "UTF-8",
						},
					},
				},
			});

			await sesClient.send(command);
			logger.info(`Invitation email sent to ${data.toEmail} for ${data.shelterName}`);
		} catch (error) {
			const errorMessage = `Failed to send invitation email to ${data.toEmail}: ${(error as Error).message}`;
			logger.error(errorMessage);
			throw error;
		}
	}

	/**
	 * Generate HTML email body for invitation
	 */
	private generateInvitationEmailHtml(data: InvitationEmailData): string {
		return `
<!DOCTYPE html>
<html>
<head>
	<style>
		body {
			font-family: Arial, sans-serif;
			line-height: 1.6;
			color: #333;
			max-width: 600px;
			margin: 0 auto;
		}
		.container {
			padding: 20px;
		}
		.header {
			background-color: #4CAF50;
			color: white;
			padding: 30px 20px;
			text-align: center;
			border-radius: 8px 8px 0 0;
		}
		.header h1 {
			margin: 0;
			font-size: 24px;
		}
		.content {
			padding: 30px 20px;
			background-color: #f9f9f9;
		}
		.content p {
			margin: 15px 0;
		}
		.button {
			display: inline-block;
			padding: 14px 28px;
			background-color: #4CAF50;
			color: white;
			text-decoration: none;
			border-radius: 5px;
			margin: 20px 0;
			font-weight: bold;
		}
		.button:hover {
			background-color: #45a049;
		}
		.footer {
			padding: 20px;
			text-align: center;
			font-size: 12px;
			color: #666;
		}
		.role-badge {
			display: inline-block;
			padding: 4px 12px;
			background-color: #e3f2fd;
			color: #1976d2;
			border-radius: 12px;
			font-weight: bold;
			text-transform: capitalize;
		}
	</style>
</head>
<body>
	<div class="container">
		<div class="header">
			<h1>🐾 You've been invited!</h1>
		</div>
		<div class="content">
			<p>Hello,</p>
			<p>
				<strong>${data.inviterName}</strong> has invited you to join
				<strong>${data.shelterName}</strong> as a
				<span class="role-badge">${data.roleName}</span>.
			</p>
			<p>
				Join the team to help manage pets, process adoption requests,
				and make a difference in animals' lives.
			</p>
			<p style="text-align: center;">
				<a href="${env.CORS_ORIGIN}/login?email=${encodeURIComponent(data.toEmail)}" class="button">
					Accept Invitation
				</a>
			</p>
			<p>
				If you have any questions, please contact ${data.inviterName} directly.
			</p>
			<p>Thank you for joining our mission!</p>
		</div>
		<div class="footer">
			<p>This is an automated email from ${data.shelterName}. Please do not reply to this email.</p>
		</div>
	</div>
</body>
</html>
		`;
	}

	/**
	 * Generate plain text email body for invitation
	 */
	private generateInvitationEmailText(data: InvitationEmailData): string {
		return `
You've been invited!

${data.inviterName} has invited you to join ${data.shelterName} as a ${data.roleName}.

Join the team to help manage pets, process adoption requests, and make a difference in animals' lives.

To accept this invitation and get started, please visit:
${env.CORS_ORIGIN}/login?email=${encodeURIComponent(data.toEmail)}

If you have any questions, please contact ${data.inviterName} directly.

Thank you for joining our mission!

---
This is an automated email from ${data.shelterName}. Please do not reply to this email.
		`;
	}
}

export const emailService = new EmailService();
