import { Document, Page, View, Text, Image, StyleSheet } from "@react-pdf/renderer";
import { Factuur, Instellingen } from "@/lib/types";
import { berekenTotalen, formatEuro, regelTotaal } from "@/lib/format";

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
  muted: { color: "#6b7280" },
  rechts: { textAlign: "right" },
  sectie: { marginBottom: 18 },
  label: { fontSize: 8, textTransform: "uppercase", color: "#6b7280", marginBottom: 2 },
  klantRij: { flexDirection: "row", justifyContent: "space-between", marginBottom: 18 },
  table: { marginBottom: 8 },
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
  colOms: { width: "46%" },
  colAantal: { width: "12%" },
  colEenheid: { width: "12%" },
  colPrijs: { width: "15%", textAlign: "right" },
  colTotaal: { width: "15%", textAlign: "right" },
  totalen: { marginLeft: "auto", width: 200, marginTop: 8 },
  totaalRij: { flexDirection: "row", justifyContent: "space-between", marginBottom: 3 },
  totaalEindRij: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#111827",
    paddingTop: 4,
    marginTop: 2,
    fontWeight: 700,
    fontSize: 12,
  },
});

export function FactuurPdf({
  factuur,
  instellingen,
}: {
  factuur: Factuur;
  instellingen: Instellingen;
}) {
  const { subtotaal, btwBedrag, totaal } = berekenTotalen(factuur.regels, factuur.btwPercentage);

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
            {(instellingen.kvkNummer || instellingen.btwNummer) && (
              <Text style={styles.muted}>
                {instellingen.kvkNummer ? `KvK ${instellingen.kvkNummer}` : ""}
                {instellingen.kvkNummer && instellingen.btwNummer ? "  ·  " : ""}
                {instellingen.btwNummer ? `BTW ${instellingen.btwNummer}` : ""}
              </Text>
            )}
            {instellingen.iban && <Text style={styles.muted}>IBAN {instellingen.iban}</Text>}
          </View>
          <View style={styles.rechts}>
            <Text style={{ fontWeight: 700 }}>Factuur {factuur.factuurNummer}</Text>
            <Text style={styles.muted}>
              Factuurdatum: {new Date(factuur.factuurdatum).toLocaleDateString("nl-NL")}
            </Text>
            <Text style={styles.muted}>
              Vervaldatum: {new Date(factuur.vervaldatum).toLocaleDateString("nl-NL")}
            </Text>
          </View>
        </View>

        <View style={styles.klantRij}>
          <View>
            <Text style={styles.label}>Aan</Text>
            <Text style={{ fontWeight: 700 }}>{factuur.klantnaam}</Text>
            <Text style={styles.muted}>{factuur.klantadres}</Text>
          </View>
        </View>

        <View style={styles.table}>
          <View style={styles.trHead}>
            <Text style={styles.colOms}>Omschrijving</Text>
            <Text style={styles.colAantal}>Aantal</Text>
            <Text style={styles.colEenheid}>Eenheid</Text>
            <Text style={styles.colPrijs}>Prijs/eenh.</Text>
            <Text style={styles.colTotaal}>Totaal</Text>
          </View>
          {factuur.regels.map((regel) => (
            <View style={styles.tr} key={regel.id}>
              <Text style={styles.colOms}>{regel.omschrijving}</Text>
              <Text style={styles.colAantal}>{regel.aantal}</Text>
              <Text style={styles.colEenheid}>{regel.eenheid}</Text>
              <Text style={styles.colPrijs}>{formatEuro(regel.prijsPerEenheid)}</Text>
              <Text style={styles.colTotaal}>{formatEuro(regelTotaal(regel))}</Text>
            </View>
          ))}
        </View>

        <View style={styles.totalen}>
          <View style={styles.totaalRij}>
            <Text style={styles.muted}>Subtotaal</Text>
            <Text>{formatEuro(subtotaal)}</Text>
          </View>
          <View style={styles.totaalRij}>
            <Text style={styles.muted}>BTW ({factuur.btwPercentage}%)</Text>
            <Text>{formatEuro(btwBedrag)}</Text>
          </View>
          <View style={styles.totaalEindRij}>
            <Text>Te betalen</Text>
            <Text>{formatEuro(totaal)}</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}
