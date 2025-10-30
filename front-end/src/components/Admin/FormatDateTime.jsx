// ✅ Hàm định dạng ngày giờ
const formatDateTime = (value) => {
  if (!value) return "-";
  const time = new Date(value);
  return Number.isNaN(time.getTime()) ? "-" : time.toLocaleString();
};
export default formatDateTime;