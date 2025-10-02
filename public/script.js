// API Configuration
const API_BASE_URL = "http://localhost:3000/api";

// Global variables
let currentPage = 1;
let currentRolePage = 1;
let roles = [];
let editingUserId = null;
let editingRoleId = null;

// Initialize application
document.addEventListener("DOMContentLoaded", function () {
  setupNavigation();
  checkServerConnection();
  loadUsers();
  loadRoles();
  setupEventListeners();
});

// Setup navigation
function setupNavigation() {
  document.getElementById("nav-users").addEventListener("click", function (e) {
    e.preventDefault();
    showSection("users-section");
    setActiveNav("nav-users");
    loadUsers();
  });

  document.getElementById("nav-roles").addEventListener("click", function (e) {
    e.preventDefault();
    showSection("roles-section");
    setActiveNav("nav-roles");
    loadRoles();
  });

  document.getElementById("nav-verify").addEventListener("click", function (e) {
    e.preventDefault();
    showSection("verify-section");
    setActiveNav("nav-verify");
  });
}

// Show section
function showSection(sectionId) {
  document.querySelectorAll(".content-section").forEach((section) => {
    section.style.display = "none";
  });
  document.getElementById(sectionId).style.display = "block";
}

// Set active navigation
function setActiveNav(navId) {
  document.querySelectorAll(".list-group-item").forEach((item) => {
    item.classList.remove("active");
  });
  document.getElementById(navId).classList.add("active");
}

// Setup event listeners
function setupEventListeners() {
  // User form submission
  document
    .getElementById("verifyForm")
    .addEventListener("submit", function (e) {
      e.preventDefault();
      verifyUser();
    });

  // Search on Enter key
  document
    .getElementById("searchUsername")
    .addEventListener("keypress", function (e) {
      if (e.key === "Enter") {
        searchUsers();
      }
    });

  document
    .getElementById("searchFullName")
    .addEventListener("keypress", function (e) {
      if (e.key === "Enter") {
        searchUsers();
      }
    });

  document
    .getElementById("searchRoleName")
    .addEventListener("keypress", function (e) {
      if (e.key === "Enter") {
        searchRoles();
      }
    });
}

// Check server connection
async function checkServerConnection() {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    if (response.ok) {
      document.getElementById("serverStatus").innerHTML =
        '<i class="fas fa-circle text-success"></i> Server Online';
    } else {
      throw new Error("Server not responding");
    }
  } catch (error) {
    document.getElementById("serverStatus").innerHTML =
      '<i class="fas fa-circle text-danger"></i> Server Offline';
    showAlert("Không thể kết nối đến server!", "danger");
  }
}

// Show alert
function showAlert(message, type = "info") {
  Swal.fire({
    title:
      type === "success"
        ? "Thành công!"
        : type === "danger"
        ? "Lỗi!"
        : "Thông báo!",
    text: message,
    icon: type === "danger" ? "error" : type,
    timer: 3000,
    showConfirmButton: false,
  });
}

// Show loading
function showLoading() {
  document.getElementById("loadingOverlay").style.display = "flex";
}

// Hide loading
function hideLoading() {
  document.getElementById("loadingOverlay").style.display = "none";
}

// ==================== USER FUNCTIONS ====================

// Load users
async function loadUsers(page = 1) {
  try {
    showLoading();
    const response = await fetch(`${API_BASE_URL}/users?page=${page}&limit=10`);
    const data = await response.json();

    if (data.success) {
      displayUsers(data.data);
      updateUsersPagination(data.pagination);
      currentPage = page;
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    showAlert("Lỗi khi tải danh sách users: " + error.message, "danger");
    document.getElementById("usersTableBody").innerHTML =
      '<tr><td colspan="8" class="text-center text-danger">Lỗi khi tải dữ liệu</td></tr>';
  } finally {
    hideLoading();
  }
}

// Display users
function displayUsers(users) {
  const tbody = document.getElementById("usersTableBody");

  if (users.length === 0) {
    tbody.innerHTML =
      '<tr><td colspan="8" class="text-center">Không có dữ liệu</td></tr>';
    return;
  }

  tbody.innerHTML = users
    .map(
      (user) => `
        <tr>
            <td class="text-truncate" style="max-width: 100px;" title="${
              user._id
            }">${user._id}</td>
            <td><strong>${user.username}</strong></td>
            <td>${user.email}</td>
            <td>${user.fullName || "-"}</td>
            <td><span class="badge bg-info">${
              user.role?.name || "N/A"
            }</span></td>
            <td>
                <span class="badge ${
                  user.status ? "bg-success" : "bg-secondary"
                }">
                    ${user.status ? "Hoạt động" : "Không hoạt động"}
                </span>
            </td>
            <td><span class="badge bg-primary">${user.loginCount}</span></td>
            <td class="action-buttons">
                <button class="btn btn-sm btn-outline-primary" onclick="editUser('${
                  user._id
                }')" title="Sửa">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-outline-info" onclick="viewUser('${
                  user._id
                }')" title="Xem">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger" onclick="deleteUser('${
                  user._id
                }')" title="Xóa">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `
    )
    .join("");
}

// Update users pagination
function updateUsersPagination(pagination) {
  const paginationEl = document.getElementById("usersPagination");
  const { page, totalPages } = pagination;

  let paginationHTML = "";

  // Previous button
  paginationHTML += `
        <li class="page-item ${page <= 1 ? "disabled" : ""}">
            <a class="page-link" href="#" onclick="loadUsers(${
              page - 1
            })">Trước</a>
        </li>
    `;

  // Page numbers
  const startPage = Math.max(1, page - 2);
  const endPage = Math.min(totalPages, page + 2);

  for (let i = startPage; i <= endPage; i++) {
    paginationHTML += `
            <li class="page-item ${i === page ? "active" : ""}">
                <a class="page-link" href="#" onclick="loadUsers(${i})">${i}</a>
            </li>
        `;
  }

  // Next button
  paginationHTML += `
        <li class="page-item ${page >= totalPages ? "disabled" : ""}">
            <a class="page-link" href="#" onclick="loadUsers(${
              page + 1
            })">Sau</a>
        </li>
    `;

  paginationEl.innerHTML = paginationHTML;
}

// Search users
async function searchUsers() {
  const username = document.getElementById("searchUsername").value.trim();
  const fullName = document.getElementById("searchFullName").value.trim();

  let queryParams = "page=1&limit=10";
  if (username) queryParams += `&username=${encodeURIComponent(username)}`;
  if (fullName) queryParams += `&fullName=${encodeURIComponent(fullName)}`;

  try {
    showLoading();
    const response = await fetch(`${API_BASE_URL}/users?${queryParams}`);
    const data = await response.json();

    if (data.success) {
      displayUsers(data.data);
      updateUsersPagination(data.pagination);
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    showAlert("Lỗi khi tìm kiếm users: " + error.message, "danger");
  } finally {
    hideLoading();
  }
}

// Open user modal
async function openUserModal(userId = null) {
  editingUserId = userId;

  // Load roles for select
  await loadRoleOptions();

  if (userId) {
    // Edit mode
    document.getElementById("userModalTitle").textContent = "Chỉnh sửa User";
    document.getElementById("password").required = false;

    try {
      const response = await fetch(`${API_BASE_URL}/users/id/${userId}`);
      const data = await response.json();

      if (data.success) {
        const user = data.data;
        document.getElementById("userId").value = user._id;
        document.getElementById("username").value = user.username;
        document.getElementById("email").value = user.email;
        document.getElementById("fullName").value = user.fullName || "";
        document.getElementById("avatarUrl").value = user.avatarUrl || "";
        document.getElementById("roleSelect").value = user.role?._id || "";
        document.getElementById("password").value = "";
      }
    } catch (error) {
      showAlert("Lỗi khi tải thông tin user: " + error.message, "danger");
    }
  } else {
    // Add mode
    document.getElementById("userModalTitle").textContent = "Thêm User Mới";
    document.getElementById("password").required = true;
    document.getElementById("userForm").reset();
    document.getElementById("userId").value = "";
  }
}

// Load role options
async function loadRoleOptions() {
  try {
    const response = await fetch(`${API_BASE_URL}/roles?limit=100`);
    const data = await response.json();

    if (data.success) {
      const roleSelect = document.getElementById("roleSelect");
      roleSelect.innerHTML = '<option value="">Chọn role...</option>';

      data.data.forEach((role) => {
        roleSelect.innerHTML += `<option value="${role._id}">${role.name}</option>`;
      });
    }
  } catch (error) {
    console.error("Error loading roles:", error);
  }
}

// Save user
async function saveUser() {
  const userId = document.getElementById("userId").value;
  const username = document.getElementById("username").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const fullName = document.getElementById("fullName").value.trim();
  const avatarUrl = document.getElementById("avatarUrl").value.trim();
  const role = document.getElementById("roleSelect").value;

  if (!username || !email || !role) {
    showAlert("Vui lòng điền đầy đủ các trường bắt buộc!", "danger");
    return;
  }

  if (!userId && !password) {
    showAlert("Vui lòng nhập password!", "danger");
    return;
  }

  const userData = {
    username,
    email,
    fullName,
    avatarUrl,
    role,
  };

  if (password) {
    userData.password = password;
  }

  try {
    showLoading();

    let response;
    if (userId) {
      // Update
      response = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });
    } else {
      // Create
      response = await fetch(`${API_BASE_URL}/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });
    }

    const data = await response.json();

    if (data.success) {
      showAlert(
        userId ? "Cập nhật user thành công!" : "Tạo user thành công!",
        "success"
      );
      bootstrap.Modal.getInstance(document.getElementById("userModal")).hide();
      loadUsers(currentPage);
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    showAlert("Lỗi: " + error.message, "danger");
  } finally {
    hideLoading();
  }
}

// View user details
async function viewUser(userId) {
  try {
    const response = await fetch(`${API_BASE_URL}/users/id/${userId}`);
    const data = await response.json();

    if (data.success) {
      const user = data.data;
      const createdAt = new Date(user.createdAt).toLocaleString("vi-VN");
      const updatedAt = new Date(user.updatedAt).toLocaleString("vi-VN");

      Swal.fire({
        title: "Thông tin User",
        html: `
                    <div class="text-start">
                        <p><strong>ID:</strong> ${user._id}</p>
                        <p><strong>Username:</strong> ${user.username}</p>
                        <p><strong>Email:</strong> ${user.email}</p>
                        <p><strong>Tên đầy đủ:</strong> ${
                          user.fullName || "Chưa có"
                        }</p>
                        <p><strong>Role:</strong> ${
                          user.role?.name || "N/A"
                        }</p>
                        <p><strong>Trạng thái:</strong> 
                            <span class="badge ${
                              user.status ? "bg-success" : "bg-secondary"
                            }">
                                ${user.status ? "Hoạt động" : "Không hoạt động"}
                            </span>
                        </p>
                        <p><strong>Số lần đăng nhập:</strong> ${
                          user.loginCount
                        }</p>
                        <p><strong>Avatar:</strong> ${
                          user.avatarUrl || "Chưa có"
                        }</p>
                        <p><strong>Ngày tạo:</strong> ${createdAt}</p>
                        <p><strong>Cập nhật cuối:</strong> ${updatedAt}</p>
                    </div>
                `,
        width: "600px",
        confirmButtonText: "Đóng",
      });
    }
  } catch (error) {
    showAlert("Lỗi khi xem chi tiết user: " + error.message, "danger");
  }
}

// Edit user
function editUser(userId) {
  openUserModal(userId);
  bootstrap.Modal.getOrCreateInstance(
    document.getElementById("userModal")
  ).show();
}

// Delete user
async function deleteUser(userId) {
  const result = await Swal.fire({
    title: "Xác nhận xóa",
    text: "Bạn có chắc chắn muốn xóa user này?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "Xóa",
    cancelButtonText: "Hủy",
  });

  if (result.isConfirmed) {
    try {
      showLoading();
      const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        showAlert("Xóa user thành công!", "success");
        loadUsers(currentPage);
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      showAlert("Lỗi khi xóa user: " + error.message, "danger");
    } finally {
      hideLoading();
    }
  }
}

// ==================== ROLE FUNCTIONS ====================

// Load roles
async function loadRoles(page = 1) {
  try {
    showLoading();
    const response = await fetch(`${API_BASE_URL}/roles?page=${page}&limit=10`);
    const data = await response.json();

    if (data.success) {
      displayRoles(data.data);
      updateRolesPagination(data.pagination);
      currentRolePage = page;
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    showAlert("Lỗi khi tải danh sách roles: " + error.message, "danger");
    document.getElementById("rolesTableBody").innerHTML =
      '<tr><td colspan="5" class="text-center text-danger">Lỗi khi tải dữ liệu</td></tr>';
  } finally {
    hideLoading();
  }
}

// Display roles
function displayRoles(roles) {
  const tbody = document.getElementById("rolesTableBody");

  if (roles.length === 0) {
    tbody.innerHTML =
      '<tr><td colspan="5" class="text-center">Không có dữ liệu</td></tr>';
    return;
  }

  tbody.innerHTML = roles
    .map(
      (role) => `
        <tr>
            <td class="text-truncate" style="max-width: 100px;" title="${
              role._id
            }">${role._id}</td>
            <td><strong>${role.name}</strong></td>
            <td>${role.description || "-"}</td>
            <td>${new Date(role.createdAt).toLocaleDateString("vi-VN")}</td>
            <td class="action-buttons">
                <button class="btn btn-sm btn-outline-primary" onclick="editRole('${
                  role._id
                }')" title="Sửa">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger" onclick="deleteRole('${
                  role._id
                }')" title="Xóa">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `
    )
    .join("");
}

// Update roles pagination
function updateRolesPagination(pagination) {
  const paginationEl = document.getElementById("rolesPagination");
  const { page, totalPages } = pagination;

  let paginationHTML = "";

  // Previous button
  paginationHTML += `
        <li class="page-item ${page <= 1 ? "disabled" : ""}">
            <a class="page-link" href="#" onclick="loadRoles(${
              page - 1
            })">Trước</a>
        </li>
    `;

  // Page numbers
  const startPage = Math.max(1, page - 2);
  const endPage = Math.min(totalPages, page + 2);

  for (let i = startPage; i <= endPage; i++) {
    paginationHTML += `
            <li class="page-item ${i === page ? "active" : ""}">
                <a class="page-link" href="#" onclick="loadRoles(${i})">${i}</a>
            </li>
        `;
  }

  // Next button
  paginationHTML += `
        <li class="page-item ${page >= totalPages ? "disabled" : ""}">
            <a class="page-link" href="#" onclick="loadRoles(${
              page + 1
            })">Sau</a>
        </li>
    `;

  paginationEl.innerHTML = paginationHTML;
}

// Search roles
async function searchRoles() {
  const name = document.getElementById("searchRoleName").value.trim();

  let queryParams = "page=1&limit=10";
  if (name) queryParams += `&name=${encodeURIComponent(name)}`;

  try {
    showLoading();
    const response = await fetch(`${API_BASE_URL}/roles?${queryParams}`);
    const data = await response.json();

    if (data.success) {
      displayRoles(data.data);
      updateRolesPagination(data.pagination);
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    showAlert("Lỗi khi tìm kiếm roles: " + error.message, "danger");
  } finally {
    hideLoading();
  }
}

// Open role modal
async function openRoleModal(roleId = null) {
  editingRoleId = roleId;

  if (roleId) {
    // Edit mode
    document.getElementById("roleModalTitle").textContent = "Chỉnh sửa Role";

    try {
      const response = await fetch(`${API_BASE_URL}/roles/${roleId}`);
      const data = await response.json();

      if (data.success) {
        const role = data.data;
        document.getElementById("roleId").value = role._id;
        document.getElementById("roleName").value = role.name;
        document.getElementById("roleDescription").value =
          role.description || "";
      }
    } catch (error) {
      showAlert("Lỗi khi tải thông tin role: " + error.message, "danger");
    }
  } else {
    // Add mode
    document.getElementById("roleModalTitle").textContent = "Thêm Role Mới";
    document.getElementById("roleForm").reset();
    document.getElementById("roleId").value = "";
  }
}

// Save role
async function saveRole() {
  const roleId = document.getElementById("roleId").value;
  const name = document.getElementById("roleName").value.trim();
  const description = document.getElementById("roleDescription").value.trim();

  if (!name) {
    showAlert("Vui lòng nhập tên role!", "danger");
    return;
  }

  const roleData = {
    name,
    description,
  };

  try {
    showLoading();

    let response;
    if (roleId) {
      // Update
      response = await fetch(`${API_BASE_URL}/roles/${roleId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(roleData),
      });
    } else {
      // Create
      response = await fetch(`${API_BASE_URL}/roles`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(roleData),
      });
    }

    const data = await response.json();

    if (data.success) {
      showAlert(
        roleId ? "Cập nhật role thành công!" : "Tạo role thành công!",
        "success"
      );
      bootstrap.Modal.getInstance(document.getElementById("roleModal")).hide();
      loadRoles(currentRolePage);
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    showAlert("Lỗi: " + error.message, "danger");
  } finally {
    hideLoading();
  }
}

// Edit role
function editRole(roleId) {
  openRoleModal(roleId);
  bootstrap.Modal.getOrCreateInstance(
    document.getElementById("roleModal")
  ).show();
}

// Delete role
async function deleteRole(roleId) {
  const result = await Swal.fire({
    title: "Xác nhận xóa",
    text: "Bạn có chắc chắn muốn xóa role này?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "Xóa",
    cancelButtonText: "Hủy",
  });

  if (result.isConfirmed) {
    try {
      showLoading();
      const response = await fetch(`${API_BASE_URL}/roles/${roleId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        showAlert("Xóa role thành công!", "success");
        loadRoles(currentRolePage);
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      showAlert("Lỗi khi xóa role: " + error.message, "danger");
    } finally {
      hideLoading();
    }
  }
}

// ==================== VERIFY USER FUNCTION ====================

// Verify and activate user
async function verifyUser() {
  const email = document.getElementById("verifyEmail").value.trim();
  const username = document.getElementById("verifyUsername").value.trim();

  if (!email || !username) {
    showAlert("Vui lòng nhập đầy đủ email và username!", "danger");
    return;
  }

  try {
    showLoading();
    const response = await fetch(`${API_BASE_URL}/users/verify-activate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, username }),
    });

    const data = await response.json();

    if (data.success) {
      const resultDiv = document.getElementById("verifyResult");
      resultDiv.innerHTML = `
                <div class="alert alert-success">
                    <h5><i class="fas fa-check-circle"></i> Xác thực thành công!</h5>
                    <p><strong>Username:</strong> ${data.data.username}</p>
                    <p><strong>Email:</strong> ${data.data.email}</p>
                    <p><strong>Tên đầy đủ:</strong> ${
                      data.data.fullName || "Chưa có"
                    }</p>
                    <p><strong>Role:</strong> ${
                      data.data.role?.name || "N/A"
                    }</p>
                    <p><strong>Trạng thái:</strong> 
                        <span class="badge bg-success">Đã kích hoạt</span>
                    </p>
                </div>
            `;
      showAlert(data.message, "success");
      document.getElementById("verifyForm").reset();
    } else {
      const resultDiv = document.getElementById("verifyResult");
      resultDiv.innerHTML = `
                <div class="alert alert-danger">
                    <h5><i class="fas fa-times-circle"></i> Xác thực thất bại!</h5>
                    <p>${data.message}</p>
                </div>
            `;
      showAlert(data.message, "danger");
    }
  } catch (error) {
    const resultDiv = document.getElementById("verifyResult");
    resultDiv.innerHTML = `
            <div class="alert alert-danger">
                <h5><i class="fas fa-times-circle"></i> Lỗi!</h5>
                <p>Lỗi khi xác thực: ${error.message}</p>
            </div>
        `;
    showAlert("Lỗi khi xác thực: " + error.message, "danger");
  } finally {
    hideLoading();
  }
}
