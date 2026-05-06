interface JsonLdProps {
  data: Record<string, unknown>;
}

export default function JsonLd({ data }: JsonLdProps) {
  // Ensure no undefined values in the JSON
  const cleanData = JSON.parse(JSON.stringify(data));

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(cleanData) }}
    />
  );
}
