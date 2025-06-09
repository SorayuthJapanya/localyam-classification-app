import { createContext, useState, useContext, useEffect } from "react";
import { get, set, del } from 'idb-keyval';

const UploadContext = createContext();
const STORAGE_TIMEOUT = 600000; // 10 นาที

export const UploadProvider = ({ children }) => {
  const [images, setImages] = useState([]);
  const [lastUpdateTime, setLastUpdateTime] = useState(Date.now());

  // โหลดข้อมูลจาก IndexedDB เมื่อเริ่มต้น
  useEffect(() => {
    const loadImages = async () => {
      try {
        const savedData = await get('uploadImagesData');
        
        if (savedData) {
          const { images: savedImages, timestamp } = savedData;
          const isExpired = Date.now() - timestamp > STORAGE_TIMEOUT;
          
          if (!isExpired) {
            setImages(savedImages);
            setLastUpdateTime(timestamp);
          } else {
            // ลบข้อมูลที่หมดอายุ
            await del('uploadImagesData');
          }
        }
      } catch (error) {
        console.error('Error loading images from IndexedDB:', error);
      }
    };
    
    loadImages();
  }, []);

  // บันทึกข้อมูลเมื่อ images เปลี่ยนแปลง
  useEffect(() => {
    const saveImages = async () => {
      const now = Date.now();
      
      if (images.length > 0) {
        try {
          await set('uploadImagesData', {
            images,
            timestamp: now
          });
          setLastUpdateTime(now);
        } catch (error) {
          console.error('Error saving images to IndexedDB:', error);
        }
      } else {
        try {
          await del('uploadImagesData');
        } catch (error) {
          console.error('Error deleting images from IndexedDB:', error);
        }
      }
    };
    
    saveImages();
  }, [images]);

  // ตรวจสอบการหมดอายุเป็นระยะ
  useEffect(() => {
    const interval = setInterval(async () => {
      const currentTime = Date.now();
      if (currentTime - lastUpdateTime > STORAGE_TIMEOUT && images.length > 0) {
        try {
          await del('uploadImagesData');
          setImages([]);
        } catch (error) {
          console.error('Error clearing expired data:', error);
        }
      }
    }, 1000); // ตรวจสอบทุก 1 วินาที

    return () => clearInterval(interval);
  }, [lastUpdateTime, images]);

  return (
    <UploadContext.Provider value={{ images, setImages }}>
      {children}
    </UploadContext.Provider>
  );
};

export const useUpload = () => useContext(UploadContext);