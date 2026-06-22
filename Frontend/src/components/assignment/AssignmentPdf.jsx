import { Document, Page, StyleSheet, Text, View, Font } from "@react-pdf/renderer";
import RobotoRegular from "../../assets/fonts/Roboto-Regular.ttf";
import RobotoBold from "../../assets/fonts/Roboto-Bold.ttf";

Font.register({
    family: "Roboto",
    fonts: [
        {
            src: RobotoRegular,
        },
        {
            src: RobotoBold, fontWeight: "bold",
        }
    ]
});

const styles = StyleSheet.create({
    page: {
        padding: 32,
        fontSize: 12,
        fontFamily: "Roboto",
    },
    header: {
        fontSize: 18,
        marginBottom: 20,
        textAlign: "center",
        fontWeight: "bold",
    },
    intro: {
        marginTop: 40,
        marginBottom: 20,
    },
    section: {
        marginBottom: 12,
    },
    row: {
        flexDirection: "row",
        marginBottom: 6,
        borderBottomWidth: 1,
        borderBottomColor: "#ddd",
        paddingBottom: 4,
    },
    label: {
        width: "35%",
        fontWeight: "bold",
    },
    confirmation: {
        marginTop: 30,
    },
    value: {
        width: "65%",
    },
    signatures: {
        marginTop: 60, flexDirection: "row", justifyContent: "space-between"
    },
    signature: {
        width: "45%", alignItems: "center"
    },
    footer: {
        marginTop: 30,
        fontSize: 10,
        textAlign: "left",
    },
});

const AssignmentPdf = ({ assignmentData }) => {

    const isAssigned = assignmentData.assignment_type === "Assignment";
    if (!assignmentData) return null;

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <Text style={styles.header}>Eszköz átadás-átvételi jegyzőkönyv</Text>

                <View style={styles.intro}>
                    <Text>A mai napon az alábbi paraméterekkel rendelkező eszközt {isAssigned ? "átadtam" : "visszavettem"} {assignmentData.user} {isAssigned ? "részére" : "részéről"}.</Text>
                </View>

                <View style={styles.section}>
                    <View style={styles.row}>
                        <Text style={styles.label}>Gyártó:</Text>
                        <Text style={styles.value}>{assignmentData.device_manufacturer || "-"}</Text>
                    </View>

                    <View style={styles.row}>
                        <Text style={styles.label}>Modell:</Text>
                        <Text style={styles.value}>{assignmentData.device_model || "-"}</Text>
                    </View>

                    <View style={styles.row}>
                        <Text style={styles.label}>Típus:</Text>
                        <Text style={styles.value}>{assignmentData.device_type || "-"}</Text>
                    </View>

                    <View style={styles.row}>
                        <Text style={styles.label}>Sorozatszám:</Text>
                        <Text style={styles.value}>{assignmentData.device_serial || "-"}</Text>
                    </View>

                    <View style={styles.row}>
                        <Text style={styles.label}>Leltári szám:</Text>
                        <Text style={styles.value}>{assignmentData.device_inventoryno || "-"}</Text>
                    </View>
                </View>

                <View style={styles.confirmation}>
                    <Text>
                        Alulírott igazolom, hogy a fenti eszköz {isAssigned ? "átadása" : "átvétele"} a megadott adatokkal megtörtént.
                    </Text>
                </View>

                <View style={styles.signatures}>
                    <View style={styles.signature}>
                        <Text>______________________________</Text>
                        <Text>Átadó aláírása</Text>
                    </View>
                    <View style={styles.signature}>
                        <Text>______________________________</Text>
                        <Text>Átvevő aláírása</Text>
                    </View>
                </View>

                <Text style={styles.footer}>
                    Dátum: {assignmentData?.assignment_date ? new Date(assignmentData.assignment_date).toLocaleString("hu-HU") : "-"}
                </Text>
            </Page>
        </Document>
    )
}
export default AssignmentPdf