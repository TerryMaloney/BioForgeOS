"use client";

import type { GeneratedProtocol } from "@/lib/protocolGenerator";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  pdf,
} from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 11,
    fontFamily: "Helvetica",
  },
  title: {
    fontSize: 18,
    marginBottom: 4,
    color: "#16a34a",
  },
  subtitle: {
    fontSize: 10,
    marginBottom: 24,
    color: "#666",
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 6,
    color: "#16a34a",
  },
  block: {
    marginBottom: 4,
    paddingLeft: 8,
  },
  bullet: {
    marginBottom: 2,
  },
  script: {
    marginTop: 8,
    padding: 8,
    backgroundColor: "#f0f0f0",
    fontSize: 10,
  },
});

function ProtocolPDFDoc({ protocol }: { protocol: GeneratedProtocol }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>BioForgeOS — Protocol</Text>
        <Text style={styles.subtitle}>
          {protocol.planName} · Generated {new Date(protocol.updatedAt).toLocaleDateString()}
        </Text>

        {protocol.phases.map((phase) => (
          <View key={phase.name} style={styles.section}>
            <Text style={styles.sectionTitle}>
              {phase.name} — {phase.weekRange}
            </Text>
            {phase.blocks.map((b, i) => (
              <View key={i} style={styles.block}>
                <Text style={styles.bullet}>• {b.label}{b.form ? ` (${b.form})` : ""}</Text>
              </View>
            ))}
            {phase.doses.length > 0 && (
              <Text style={styles.bullet}>Doses: {phase.doses.join("; ")}</Text>
            )}
            {phase.evidence.length > 0 && (
              <Text style={styles.bullet}>Evidence: {phase.evidence.slice(0, 2).join(" ")}</Text>
            )}
          </View>
        ))}

        {protocol.doctorScripts.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Doctor script template</Text>
            <View style={styles.script}>
              <Text>{protocol.doctorScripts[0]}</Text>
            </View>
          </View>
        )}

        {protocol.biomarkerGates.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Biomarker gates</Text>
            {protocol.biomarkerGates.slice(0, 10).map((g, i) => (
              <Text key={i} style={styles.bullet}>• {g}</Text>
            ))}
          </View>
        )}
      </Page>
    </Document>
  );
}

export async function ProtocolPDF({ protocol }: { protocol: GeneratedProtocol }): Promise<Blob> {
  const blob = await pdf(<ProtocolPDFDoc protocol={protocol} />).toBlob();
  return blob;
}
