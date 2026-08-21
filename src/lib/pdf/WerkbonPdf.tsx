import { Document, Page, View, Text, Image, StyleSheet } from "@react-pdf/renderer";
import { Instellingen, Offerte } from "@/lib/types";

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 10, fontFamily: "Helvetica", color: "#111827" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#111827",
    paddingBottom: 16,
    marginBottom: 24,
  },
  logo: { width: 40, height: 40, marginBottom: 6, objectFit: "contain" },
  bedrijfsnaam: { fontSize: 14, fontWeight: 700, marginBottom: 2 },
  titel: { fontSize: 18, fontWeight: 700 },
  muted: { color: "#6b7280" },
  rechts: { textAlign: "right" },
  sectie: { marginBottom: 18 },
  label: { fontSize: 8, textTransform: "uppercase", color: "#6b7280", marginBottom: 2 },
  klantRij: { flexDirection: "row", justifyContent: "space-between", marginBottom: 18 },
  table: { marginTop: 6 },
  tr: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#e5e7eb", paddingVertical: 6 },
  trHead: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#111827",
    paddingBottom: 6,
    fontSize: 8,
    textTransform: "uppercase",
    color: "#6b7280",
  },
  colOms: { width: "55%" },
  colType: { width: "20%" },
  colAantal: { width: "25%" },
});

function formatteerDatumTijd(iso: string) {
  return new Date(iso).toLocaleString("nl-NL", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function WerkbonPdf({
  offerte,
  instellingen,
}: {
  offerte: Offerte;
  instellingen: Instellingen;
}) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            {instellingen.logoUrl && (
              // eslint-disable-next-line jsx-a11y/alt-text -- react-pdf Image, geen HTML <img>
              <Image src={instellingen.logoUrl} style={styles.logo} />
            )}
            <Text style={styles.bedrijfsnaam}>{instellingen.bedrijfsnaam}</Text>
            <Text style={styles.muted}>{instellingen.adres}</Text>
            {instellingen.telefoon && <Text style={styles.muted}>{instellingen.telefoon}</Text>}
          </View>
          <View style={styles.rechts}>
            <Text style={styles.titel}>Werkbon</Text>
            <Text style={styles.muted}>Ref. {offerte.offerteNummer}</Text>
          </View>
        </View>

        <View style={styles.klantRij}>
          <View>
            <Text style={styles.label}>Klant</Text>
            <Text style={{ fontWeight: 700 }}>{offerte.klantnaam}</Text>
            <Text style={styles.muted}>{offerte.klantadres}</Text>
            {offerte.klantEmail && <Text style={styles.muted}>{offerte.klantEmail}</Text>}
          </View>
          <View style={styles.rechts}>
            <Text style={styles.label}>Geplande datum</Text>
            <Text style={{ fontWeight: 700 }}>
              {offerte.planningDatum ? formatteerDatumTijd(offerte.planningDatum) : "Nog niet ingepland"}
            </Text>
          </View>
        </View>

        <View style={styles.sectie}>
          <Text style={styles.label}>Klusomschrijving</Text>
          <Text>{offerte.klusOmschrijving}</Text>
        </View>

        {offerte.planningNotitie && (
          <View style={styles.sectie}>
            <Text style={styles.label}>Notitie bij afspraak</Text>
            <Text>{offerte.planningNotitie}</Text>
          </View>
        )}

        <View style={styles.sectie}>
          <Text style={styles.label}>Materiaal &amp; arbeid</Text>
          <View style={styles.table}>
            <View style={styles.trHead}>
              <Text style={styles.colOms}>Omschrijving</Text>
              <Text style={styles.colType}>Type</Text>
              <Text style={styles.colAantal}>Aantal</Text>
            </View>
            {offerte.regels.map((regel) => (
              <View style={styles.tr} key={regel.id}>
                <Text style={styles.colOms}>{regel.omschrijving}</Text>
                <Text style={styles.colType}>
                  {regel.type === "materiaal" ? "Materiaal" : "Arbeid"}
                </Text>
                <Text style={styles.colAantal}>
                  {regel.aantal} {regel.eenheid}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {offerte.opmerkingen && (
          <View style={styles.sectie}>
            <Text style={styles.label}>Opmerkingen</Text>
            <Text>{offerte.opmerkingen}</Text>
          </View>
        )}
      </Page>
    </Document>
  );
}
