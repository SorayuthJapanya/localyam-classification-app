import { useQuery } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import { axiosInstance } from "../../lib/axios";
import toast from "react-hot-toast";
import {
  Page,
  Text,
  View,
  Document,
  PDFViewer,
  Image,
} from "@react-pdf/renderer";
import { styles } from "./StylePreviewReport.js";
const PreviewReportPage = () => {
  const [userData, setUserData] = useState([]);
  const [historySelected, setHistorySelected] = useState([]);
  const [historySelectedData, setHistorySelectedData] = useState([]);

  const { data: authUser, isLoading: isGetUserLoading } = useQuery({
    queryKey: ["authUser"],
    queryFn: async () => {
      const res = await axiosInstance.get("/auth/me");
      return res.data;
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Fetch user data failed");
    },
  });

  const { data: getHistorySelected } = useQuery({
    queryKey: ["getHistorySelected", { dataId: historySelected }],
    queryFn: async () => {
      const res = await axiosInstance.get("/history/history-selected", {
        params: {
          dataId: historySelected,
        },
        paramsSerializer: {
          indexes: null,
        },
      });
      return res.data;
    },
    enabled: !!historySelected.length,
    onError: (error) => {
      toast.error(error.response?.data?.message || "Fetch history data failed");
    },
  });

  const currentDateTime = new Date().toLocaleString("th-TH", {
    dateStyle: "long",
    timeStyle: "short",
  });

  const parseExifDate = (exifString) => {
    if (
      !exifString ||
      typeof exifString !== "string" ||
      !exifString.includes(" ")
    ) {
      return null;
    }

    try {
      const [datePart, timePart] = exifString.split(" ");
      const [year, month, day] = datePart.split(":");
      const [hours, minutes, seconds] = timePart.split(":");

      return new Date(year, month - 1, day, hours, minutes, seconds);
    } catch (error) {
      console.error("Invalid EXIF date format:", exifString, error);
      return null;
    }
  };

  useEffect(() => {
    if (authUser) {
      setUserData(authUser);
    }

    if (getHistorySelected) {
      setHistorySelectedData(getHistorySelected);
      localStorage.removeItem("historySelected");
    }
  }, [authUser, getHistorySelected]);

  useEffect(() => {
    const data = localStorage.getItem("historySelected");
    if (data) {
      setHistorySelected(JSON.parse(data));
    }
  }, []);

  if (isGetUserLoading) {
    return (
      <div className="w-full min-h-160 flex justify-center items-center text-red-500">
        <p>Fetch data failed</p>
      </div>
    );
  }

  // fixed item per page
  const itemsPerPage = 4;
  const totalPages = Math.ceil(historySelectedData.length / itemsPerPage);

  const ReportPDF = () => (
    <Document title="ใบรายงานผลการจำแนกพันธุ์มันพื้นบ้านจากภาพใบ">
      {Array.from({ length: totalPages }, (_, pageIndex) => {
        const startIndex = pageIndex * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const pageData = historySelectedData.slice(startIndex, endIndex);

        return (
          <Page key={pageIndex} size="A4" style={styles.page}>
            {/* Page number */}
            <View style={styles.pageNumberContainer}>
              <Text style={styles.pageNumber}>
                หน้า {pageIndex + 1} จาก {totalPages}
              </Text>
            </View>

            {/* Organization Header */}
            <View fixed>
              <View style={styles.header}>
                <View>
                  <Text>
                    โครงการอนุรักษ์พันธุกรรมพืชอันเนื่องมาจากพระราชดำริ
                    สมเด็จพระเทพรัตนราชสุดาฯ สยามบรมราชกุมารี (อพ.สธ.){" "}
                  </Text>
                </View>
              </View>
            </View>

            {/* Report Header */}
            <View style={styles.headerReport}>
              <View style={styles.headerReportInfo}>
                <Text>ใบรายงานผลการจำแนกพันธุ์มันพื้นบ้านจากภาพใบ </Text>
              </View>
              <View>
                <Text>
                  ** พิมพ์จากระบบจำแนกพันธุ์มันพื้นบ้านจากภาพใบ วันที่{" "}
                  {currentDateTime}
                </Text>
              </View>
            </View>

            {/* User Information Section - Repeated on every page */}
            <View style={styles.userInfoContainer}>
              <View style={styles.userInfoColumn}>
                <Text style={styles.userInfoText}>
                  ชื่อ-สกุล: {userData.name}
                </Text>
                <Text style={styles.userInfoText}>
                  ตำแหน่ง: {userData.position || "-"}
                </Text>
                <Text style={styles.userInfoText}>
                  หน่วยงาน: {userData.department || "-"}
                </Text>
              </View>
              <View style={styles.userInfoColumn}>
                <Text style={styles.userInfoText}>
                  องค์กร: {userData.organization || "-"}
                </Text>
                <Text style={styles.userInfoText}>อีเมล: {userData.email}</Text>
                <Text style={styles.userInfoText}>
                  โทรศัพท์: {userData.phone_number || "-"}
                </Text>
              </View>
            </View>

            {/* History Data Table */}
            <View>
              <Text style={styles.sectionTitle}>ผลการจำแนกพันธุ์ </Text>
              {pageData.map((item, index) => (
                <View key={item._id} style={styles.sectionInfoContainer}>
                  {/* ส่วนรูปภาพ */}
                  <View style={styles.sectionInfoImage}>
                    {item.imageUrl ? (
                      <Image
                        src={`${import.meta.env.VITE_SERVER_URL}/uploads/${
                          item.imageUrl
                        }`}
                        style={styles.imageStyle}
                      />
                    ) : (
                      <Text style={styles.imagePlaceholder}>ไม่มีรูปภาพ</Text>
                    )}
                  </View>

                  {/* ส่วนรายละเอียด */}
                  <View style={styles.sectionInfoDescription}>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>ลำดับที่: </Text>
                      <Text style={styles.infoValue}>
                        {startIndex + index + 1}
                      </Text>
                    </View>

                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>ชื่อผู้ทำการจำแนก: </Text>
                      <Text style={styles.infoValue}>{item.userName}</Text>
                    </View>

                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>พันธุ์ที่พบ: </Text>
                      <Text style={[styles.infoValue, styles.highlightText]}>
                        {item.bestpredicted}
                      </Text>
                    </View>

                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>ความมั่นใจ: </Text>
                      <Text style={styles.infoValue}>
                        {item.confidenceScore}%
                      </Text>
                    </View>

                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>วันที่บันทึก: </Text>
                      <Text style={styles.infoValue}>
                        {parseExifDate(item.datetime_taken)?.toLocaleString(
                          "th-TH",
                          {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          }
                        ) ||
                          new Date(item.createdAt).toLocaleString("th-TH", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                      </Text>
                    </View>

                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>ตำแหน่ง: </Text>
                      <Text style={styles.infoValue}>
                        {item.latitude}, {item.longitude}
                      </Text>
                    </View>

                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>เวลาประมวลผล: </Text>
                      <Text style={styles.infoValue}>
                        {(item.process_time / 1000).toFixed(2)} วินาที
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </Page>
        );
      })}
    </Document>
  );

  return (
    <div className="w-full min-h-160">
      <PDFViewer width="100%" height="800px">
        <ReportPDF />
      </PDFViewer>
    </div>
  );
};

export default PreviewReportPage;
