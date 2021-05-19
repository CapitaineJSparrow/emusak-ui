import Swal from "sweetalert2";

export const addYuzuPath = async () => {
  const {isConfirmed: standardPath, isDenied: customPath, isDismissed } = await Swal.fire({
    title: 'Notice',
    showDenyButton: true,
    showCancelButton: true,
    confirmButtonText: `Yuzu standard path`,
    denyButtonText: `Custom path`,
    html: `
      You must pick a valid Yuzu folder where "yuzu.exe" or "yuzu" (for linux users) is located. If you are using portable mode, you can add multiple yuzu instances by clicking again this button
      <br />
      <br />
      If you downloaded yuzu from official website or if you are not using portable mode, select "Yuzu standard path" button, if you are using portable mode use "Custom path" button
    `,
  });

  if (isDismissed) {
    return false;
  }

  if (standardPath) {

  }
}
