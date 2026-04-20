'use server'

import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { supabase } from "@/lib/supabase";

export async function submitDocumentAction(formData: FormData) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id || session.user.role !== 'SCHOLAR') {
    throw new Error("Unauthorized: Only scholars can submit documents");
  }

  const type = formData.get("type") as string;
  const notes = formData.get("notes") as string;
  const file = formData.get("file") as File;
  const extractedText = formData.get("extractedText") as string | null;
  const gradesData = formData.get("gradesData") as string | null;

  if (!file || !type) {
    throw new Error("Missing required fields");
  }
  
  // Hardened backend validation
  if (file.size > 10 * 1024 * 1024) {
    throw new Error("File exceeds 10MB limit");
  }
  
  if (!file.name.match(/\.(png|jpg|jpeg|pdf)$/i)) {
    throw new Error("Invalid file extension");
  }

  // Upload to Supabase Storage Bucket
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  
  const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '');
  const filePath = `${session.user.id}/${Date.now()}-${safeName}`;
  
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('documents')
    .upload(filePath, buffer, {
      contentType: file.type,
      upsert: false
    });
    
  if (uploadError) {
    console.error("Supabase Storage Error:", uploadError);
    throw new Error("Failed to secure document in cloud storage. Did you create the bucket?");
  }
  
  const { data: urlData } = supabase.storage
     .from('documents')
     .getPublicUrl(filePath);

  const fileUrl = urlData.publicUrl;

  await db.document.create({
    data: {
      scholarId: session.user.id,
      title: file.name,
      type: type,
      notes: notes,
      fileUrl: fileUrl,
      extractedText: extractedText || null,
      gradesData: gradesData || null,
      status: "pending",
    }
  });

  revalidatePath("/scholar");
  return { success: true };
}
