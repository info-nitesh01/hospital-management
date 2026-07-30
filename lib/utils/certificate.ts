import * as forge from "node-forge";

export interface CertificateInfo {
  commonName: string;
}

export type ParseResult =
  | { success: true; info: CertificateInfo }
  | { success: false; error: "invalid_password" | "invalid_file" | "no_certificate" | "unknown" };

/**
 * Parse a PFX/PKCS#12 certificate and extract the certificate holder's name
 * @param base64Data - The base64 data URL of the PFX file
 * @param password - The password to decrypt the PFX file
 * @returns ParseResult with certificate info or error type
 */
export function parsePfxCertificate(
  base64Data: string,
  password: string
): ParseResult {
  try {
    // Remove the data URL prefix if present (e.g., "data:application/x-pkcs12;base64,")
    const base64Content = base64Data.includes(",")
      ? base64Data.split(",")[1]
      : base64Data;

    // Decode base64 to binary string
    const binaryString = atob(base64Content);

    // Convert to forge's ASN.1 format
    const p12Asn1 = forge.asn1.fromDer(binaryString);

    // Parse the PKCS#12 structure with strict mode disabled for better compatibility
    // Pass password as empty string if not provided (some certs have no password)
    const p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, false, password || "");

    // Get the certificate bags
    const certBags = p12.getBags({ bagType: forge.pki.oids.certBag });
    const certificates = certBags[forge.pki.oids.certBag];

    if (!certificates || certificates.length === 0) {
      return { success: false, error: "no_certificate" };
    }

    // Get the first certificate
    const cert = certificates[0].cert;
    if (!cert) {
      return { success: false, error: "no_certificate" };
    }

    // Extract the Common Name from the certificate subject
    const cnField = cert.subject.getField("CN");
    const commonName = cnField ? String(cnField.value) : "Unknown";

    return {
      success: true,
      info: { commonName },
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);

    // Check for specific error types
    if (errorMessage.includes("Invalid password") || errorMessage.includes("MAC could not be verified")) {
      return { success: false, error: "invalid_password" };
    }
    if (errorMessage.includes("Too few bytes") || errorMessage.includes("Invalid")) {
      return { success: false, error: "invalid_file" };
    }

    console.error("Failed to parse PFX certificate:", error);
    return { success: false, error: "unknown" };
  }
}

/**
 * Generate a visible signature image from certificate info
 * @param certInfo - The certificate information
 * @returns PNG data URL of the signature image
 */
export function generateCertificateSignatureImage(
  certInfo: CertificateInfo
): string {
  const canvas = document.createElement("canvas");
  canvas.width = 400;
  canvas.height = 100;
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Failed to create canvas context");
  }

  // White background
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw the name in a signature-style font
  ctx.fillStyle = "black";
  ctx.font = "italic 32px 'Brush Script MT', 'Lucida Handwriting', cursive";
  ctx.textBaseline = "middle";
  ctx.fillText(certInfo.commonName, 20, 40);

  // Draw the date
  ctx.font = "14px Arial, sans-serif";
  ctx.fillStyle = "#666666";
  const dateStr = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  ctx.fillText(dateStr, 20, 75);

  return canvas.toDataURL("image/png");
}
