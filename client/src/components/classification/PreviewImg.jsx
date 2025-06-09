import { useUpload } from "../../context/UploadContext";

const PreviewPage = () => {
  const { images } = useUpload();
  console.log(images);

  if (images.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        No Images Selected
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-10">
      {images.map((src, index) => (
        <div key={index} className="w-full">
          <img
            src={src}
            alt={`preview-${index}`}
            className="w-full h-auto rounded-lg shadow-lg"
          />
        </div>
      ))}
    </div>
  );
};

export default PreviewPage;
