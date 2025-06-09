import { Font, StyleSheet } from "@react-pdf/renderer";
import thSarabunLight from "../../../assets/fonts/Sarabun-Light.ttf";
import thSarabunSemiBold from "../../../assets/fonts/Sarabun-SemiBold.ttf";

Font.register({
  family: "THSarabunNewLight",
  src: thSarabunLight,
});

Font.register({
  family: "thSarabunSemiBold",
  src: thSarabunSemiBold,
});

export const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#FFFFFF",
    fontFamily: "THSarabunNewLight",
    fontSize: 9,
    fontWeight: 100,
    padding: 36,
  },
  pageNumberContainer: {
    position: "absolute",
    top: 20,
    right: 20,
  },
  pageNumber: {
    fontSize: 10,
    color: "#666",
  },
  header: {
    flexDirection: "column",
    justifyContent: "center",
    fontFamily: "thSarabunSemiBold",
    fontSize: 10,
    marginBottom: "18px",
    textAlign: "center",
    paddingTop: 5,
  },
  headerReport: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: "8px",
  },
  headerReportInfo: {
    fontSize: 9,
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    fontFamily: "thSarabunSemiBold",
    marginBottom: "12px",
  },
  userInfoContainer: {
    flexDirection: "row",
    marginBottom: 18,
    paddingTop: 10,
    paddingHorizontal: 30,
  },
  userInfoColumn: {
    gap: 4,
    width: "50%",
    flexDirection: "column",
  },
  userInfoText: {
    fontSize: 10,
    fontFamily: "THSarabunNewLight",
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 10,
    fontFamily: "thSarabunSemiBold",
    marginBottom: 15,
    textAlign: "center",
  },
  sectionInfoContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderBottom: "1px solid #ccc",
  },
  sectionInfoImage: {
    width: "50%",
    padding: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionInfoDescription: {
    width: "50%",
    paddingLeft: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  imageStyle: {
    width: 100,
    height: 100,
    objectFit: "cover",
    border: "1px solid #ddd",
    borderRadius: 2,
  },
  imagePlaceholder: {
    width: 100,
    height: 100,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "1px dashed #ccc",
  },
  infoRow: {
    flexDirection: "row",
    marginBottom: 5,
  },
  infoLabel: {
    width: "40%",
    fontFamily: "thSarabunSemiBold",
    fontSize: 9,
  },
  infoValue: {
    width: "60%",
    fontFamily: "THSarabunNewLight",
    fontSize: 9,
  },
  highlightText: {
    fontWeight: "bold",
  },
});
