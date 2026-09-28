// Shared organizational data for branches, departments, and positions
export const orgData = {
  branches: [
    { id: '6612', name: 'Hội sở' },
    { id: '6613', name: 'Chi nhánh Đức Hòa BLA' },
    { id: '6609', name: 'Chi nhánh Đức Huệ BLA' },
    { id: '6619', name: 'Chi nhánh Tân Mỹ BLA' },
    { id: '6620', name: 'Chi nhánh Mộ Hóa BLA' },
    { id: '6668', name: 'Chi nhánh Đức Hòa Thượng BLA' }
  ],
  departments: {
    hs: [
      { id: 'hs-kt', name: 'Kế toán & ngân quỹ' },
      { id: 'hs-pgd', name: 'Phòng giao dịch 3/2' },
      { id: 'hs-kh', name: 'Phòng Khách hàng' },
      { id: 'hs-th', name: 'Phòng Tổng hợp' },
      { id: 'hs-ktgs', name: 'Phòng Kiểm tra giám sát nội bộ' },
      { id: 'hs-qlrr', name: 'Phòng Kế hoạch & quản lý rủi ro' },
      { id: 'hs-gd', name: 'Ban giám đốc' }
    ],
    6613: [
      { id: '6613-kt', name: 'Kế toán & ngân quỹ' },
      { id: '6613-kh', name: 'Phòng Khách hàng' },
      { id: '6613-th', name: 'Phòng Tổng hợp' },
      { id: '6613-gd', name: 'Ban giám đốc' }
    ],
    6609: [
      { id: '6609-kt', name: 'Kế toán & ngân quỹ' },
      { id: '6609-pgd', name: 'Phòng giao dịch Mỹ Quí' },
      { id: '6609-kh', name: 'Phòng Khách hàng' },
      { id: '6609-th', name: 'Phòng Tổng hợp' },
      { id: '6609-gd', name: 'Ban giám đốc' }
    ],
    6619: [
      { id: '6619-kt', name: 'Kế toán & ngân quỹ' },
      { id: '6619-pgd', name: 'Phòng giao dịch Lộc Giang' },
      { id: '6619-kh', name: 'Phòng Khách hàng' },
      { id: '6619-th', name: 'Phòng Tổng hợp' },
      { id: '6619-gd', name: 'Ban giám đốc' }
    ],
    6620: [
      { id: '6620-kt', name: 'Kế toán & ngân quỹ' },
      { id: '6620-kh', name: 'Phòng Khách hàng' },
      { id: '6620-th', name: 'Phòng Tổng hợp' },
      { id: '6620-gd', name: 'Ban giám đốc' }
    ],
    6668: [
      { id: '6668-kt', name: 'Kế toán & ngân quỹ' },
      { id: '6668-kh', name: 'Phòng Khách hàng' },
      { id: '6668-th', name: 'Phòng Tổng hợp' },
      { id: '6668-gd', name: 'Ban giám đốc' }
    ]
  },
  positions: {
    //Hội sở
    'hs-kt': [
      { id: 'hs-kt-tp', name: 'Trưởng phòng' },
      { id: 'hs-kt-pp', name: 'Phó Trưởng phòng' },
      { id: 'hs-kt-nv-1', name: 'Nhân viên Nhóm I' },
      { id: 'hs-kt-nv-2', name: 'Nhân viên Nhóm II' }
    ],
    'hs-pgd': [
      { id: 'hs-pgd-tp', name: 'Giám đốc' },
      { id: 'hs-pgd-pp', name: 'Phó Giám đốc' },
      { id: 'hs-pgd-kt', name: 'Nhân viên kết toán' },
      { id: 'hs-pgd-cv', name: 'Nhân viên phát triển cho vay' }
    ],
    'hs-kh': [
      { id: 'hs-kh-tp', name: 'Trưởng phòng' },
      { id: 'hs-kh-pp', name: 'Phó Trưởng phòng' },
      { id: 'hs-kh-ct', name: 'Cán bộ chuyên trách' },
      { id: 'hs-kh-cv', name: 'Nhân viên phát triển cho vay' },
      { id: 'hs-kh-cv-xln', name: 'Nhân viên phát triển cho vay và xử lý nợ' },
      { id: 'hs-kh-tt', name: 'Nhân viên thanh toán quốc tế' }
    ],
    'hs-th': [
      { id: 'hs-th-tp', name: 'Trưởng phòng' },
      { id: 'hs-th-pp', name: 'Phó Trưởng phòng' },
      { id: 'hs-th-nv', name: 'Nhân viên' }
    ],
    'hs-ktgs': [
      { id: 'hs-ktgs-tp', name: 'Trưởng phòng' },
      { id: 'hs-ktgs-pp', name: 'Phó Trưởng phòng' },
      { id: 'hs-ktgs-nv', name: 'Nhân viên' }
    ],
    'hs-qlrr': [
      { id: 'hs-qlrr-tp', name: 'Trưởng phòng' },
      { id: 'hs-qlrr-pp', name: 'Phó Trưởng phòng' },
      { id: 'hs-qlrr-nv', name: 'Nhân viên' }
    ],
    'hs-gd': [
      { id: 'hs-gd-gd', name: 'Giám đốc' },
      { id: 'hs-gd-pgd', name: 'Phó Giám đốc' }
    ],

    //6609
    '6609-kt': [
      { id: '6609-kt-tp', name: 'Trưởng phòng' },
      { id: '6609-kt-pp', name: 'Phó Trưởng phòng' },
      { id: '6609-kt-nv-1', name: 'Nhân viên Nhóm I' },
      { id: '6609-kt-nv-2', name: 'Nhân viên Nhóm II' }
    ],
    '6609-kh': [
      { id: '6609-kh-tp', name: 'Trưởng phòng' },
      { id: '6609-kh-pp', name: 'Phó Trưởng phòng' },
      { id: '6609-kh-cv', name: 'Nhân viên phát triển cho vay' },
      { id: '6609-kh-kt', name: 'Nhân viên kế toán' }
    ],
    '6609-pgd': [
      { id: '6609-pgd-tp', name: 'Giám đốc' },
      { id: '6609-pgd-pp', name: 'Phó Giám đốc' },
      { id: '6609-pgd-kt', name: 'Nhân viên kế toán' },
      { id: '6609-pgd-cv', name: 'Nhân viên phát triển cho vay' }
    ],
    '6609-th': [
      { id: '6609-th-tp', name: 'Trưởng phòng' },
      { id: '6609-th-pp', name: 'Phó Trưởng phòng' },
      { id: '6609-th-nv', name: 'Nhân viên' }
    ],
    '6609-gd': [
      { id: '6609-gd-gd', name: 'Giám đốc' },
      { id: '6609-gd-pgd', name: 'Phó Giám đốc' }
    ],

    //6613
    '6613-kt': [
      { id: '6613-kt-tp', name: 'Trưởng phòng' },
      { id: '6613-kt-pp', name: 'Phó Trưởng phòng' },
      { id: '6613-kt-nv-1', name: 'Nhân viên Nhóm I' },
      { id: '6613-kt-nv-2', name: 'Nhân viên Nhóm II' }
    ],
    '6613-kh': [
      { id: '6613-kh-tp', name: 'Trưởng phòng' },
      { id: '6613-kh-pp', name: 'Phó Trưởng phòng' },
      { id: '6613-kh-cv', name: 'Nhân viên phát triển cho vay' },
      { id: '6613-kh-kt', name: 'Nhân viên kế toán' }
    ],
    '6613-th': [
      { id: '6613-th-tp', name: 'Trưởng phòng' },
      { id: '6613-th-pp', name: 'Phó Trưởng phòng' },
      { id: '6613-th-nv', name: 'Nhân viên' }
    ],
    '6613-gd': [
      { id: '6613-gd-gd', name: 'Giám đốc' },
      { id: '6613-gd-pgd', name: 'Phó Giám đốc' }
    ],

    //6619
    '6619-kt': [
      { id: '6619-kt-tp', name: 'Trưởng phòng' },
      { id: '6619-kt-pp', name: 'Phó Trưởng phòng' },
      { id: '6619-kt-nv-1', name: 'Nhân viên Nhóm I' },
      { id: '6619-kt-nv-2', name: 'Nhân viên Nhóm II' }
    ],
    '6619-kh': [
      { id: '6619-kh-tp', name: 'Trưởng phòng' },
      { id: '6619-kh-pp', name: 'Phó Trưởng phòng' },
      { id: '6619-kh-cv', name: 'Nhân viên phát triển cho vay' },
      { id: '6619-kh-kt', name: 'Nhân viên kế toán' }
    ],
    '6619-pgd': [
      { id: '6619-pgd-tp', name: 'Giám đốc' },
      { id: '6619-pgd-pp', name: 'Phó Giám đốc' },
      { id: '6619-pgd-cv', name: 'Nhân viên phát triển cho vay' },
      { id: '6619-pgd-kt', name: 'Nhân viên kế toán' }
    ],
    '6619-th': [
      { id: '6619-th-tp', name: 'Trưởng phòng' },
      { id: '6619-th-pp', name: 'Phó Trưởng phòng' },
      { id: '6619-th-nv', name: 'Nhân viên' }
    ],
    '6619-gd': [
      { id: '6619-gd-gd', name: 'Giám đốc' },
      { id: '6619-gd-pgd', name: 'Phó Giám đốc' }
    ],

    //6620
    '6620-kt': [
      { id: '6620-kt-tp', name: 'Trưởng phòng' },
      { id: '6620-kt-pp', name: 'Phó Trưởng phòng' },
      { id: '6620-kt-nv-1', name: 'Nhân viên Nhóm I' },
      { id: '6620-kt-nv-2', name: 'Nhân viên Nhóm II' }
    ],
    '6620-kh': [
      { id: '6620-kh-tp', name: 'Trưởng phòng' },
      { id: '6620-kh-pp', name: 'Phó Trưởng phòng' },
      { id: '6620-kh-cv', name: 'Nhân viên phát triển cho vay' },
      { id: '6620-kh-kt', name: 'Nhân viên kế toán' }
    ],
    '6620-th': [
      { id: '6620-th-tp', name: 'Trưởng phòng' },
      { id: '6620-th-pp', name: 'Phó Trưởng phòng' },
      { id: '6620-th-nv', name: 'Nhân viên' }
    ],
    '6620-gd': [
      { id: '6620-gd-gd', name: 'Giám đốc' },
      { id: '6620-gd-pgd', name: 'Phó Giám đốc' }
    ],

    //6668
    '6668-kt': [
      { id: '6668-kt-tp', name: 'Trưởng phòng' },
      { id: '6668-kt-pp', name: 'Phó Trưởng phòng' },
      { id: '6668-kt-nv-1', name: 'Nhân viên Nhóm I' },
      { id: '6668-kt-nv-2', name: 'Nhân viên Nhóm II' }
    ],
    '6668-kh': [
      { id: '6668-kh-tp', name: 'Trưởng phòng' },
      { id: '6668-kh-pp', name: 'Phó Trưởng phòng' },
      { id: '6668-kh-cv', name: 'Nhân viên phát triển cho vay' },
      { id: '6668-kh-kt', name: 'Nhân viên kế toán' }
    ],
    '6668-th': [
      { id: '6668-th-tp', name: 'Trưởng phòng' },
      { id: '6668-th-pp', name: 'Phó Trưởng phòng' },
      { id: '6668-th-nv', name: 'Nhân viên' }
    ],
    '6668-gd': [
      { id: '6668-gd-gd', name: 'Giám đốc' },
      { id: '6668-gd-pgd', name: 'Phó Giám đốc' }
    ]
  },

  roles: {
    //Hội sở
    'hs-kt': [
      { id: 'manager', name: 'Trưởng phòng' },
      { id: 'deputy_manager', name: 'Phó Trưởng phòng' },
      { id: 'employee', name: 'Nhân viên ' }
    ],
    'hs-pgd': [
      { id: 'director_TO', name: 'Giám đốc' },
      { id: 'deputy_director_TO', name: 'Phó Giám đốc' },
      { id: 'employee', name: 'Nhân viên ' }
    ],
    'hs-kh': [
      { id: 'manager', name: 'Trưởng phòng' },
      { id: 'deputy_manager', name: 'Phó Trưởng phòng' },
      { id: 'employee', name: 'Nhân viên ' }
    ],
    'hs-th': [
      { id: 'manager', name: 'Trưởng phòng' },
      { id: 'deputy_manager', name: 'Phó Trưởng phòng' },
      { id: 'employee', name: 'Nhân viên' }
    ],
    'hs-ktgs': [
      { id: 'manager', name: 'Trưởng phòng' },
      { id: 'deputy_manager', name: 'Phó Trưởng phòng' },
      { id: 'employee', name: 'Nhân viên' }
    ],
    'hs-qlrr': [
      { id: 'manager', name: 'Trưởng phòng' },
      { id: 'deputy_manager', name: 'Phó Trưởng phòng' },
      { id: 'employee', name: 'Nhân viên' }
    ],
    'hs-gd': [
      { id: 'director', name: 'Giám đốc' },
      { id: 'deputy_director', name: 'Phó Giám đốc' }
    ],

    //6609
    '6609-kt': [
      { id: 'manager_II', name: 'Trưởng phòng' },
      { id: 'deputy_manager_II', name: 'Phó Trưởng phòng' },
      { id: 'employee', name: 'Nhân viên' }
    ],
    '6609-kh': [
      { id: 'manager_II', name: 'Trưởng phòng' },
      { id: 'deputy_manager_II', name: 'Phó Trưởng phòng' },
      { id: 'employee', name: 'Nhân viên' }
    ],
    '6609-pgd': [
      { id: 'director_TO', name: 'Giám đốc' },
      { id: 'deputy_director_TO', name: 'Phó Giám đốc' },
      { id: 'employee', name: 'Nhân viên ' }
    ],
    '6609-th': [
      { id: 'manager_II', name: 'Trưởng phòng' },
      { id: 'deputy_manager_II', name: 'Phó Trưởng phòng' },
      { id: 'employee', name: 'Nhân viên' }
    ],
    '6609-gd': [
      { id: 'director_II', name: 'Giám đốc' },
      { id: 'deputy_director_II', name: 'Phó Giám đốc' }
    ],

    //6613
    '6613-kt': [
      { id: 'manager_II', name: 'Trưởng phòng' },
      { id: 'deputy_manager_II', name: 'Phó Trưởng phòng' },
      { id: 'employee', name: 'Nhân viên' }
    ],
    '6613-kh': [
      { id: 'manager_II', name: 'Trưởng phòng' },
      { id: 'deputy_manager_II', name: 'Phó Trưởng phòng' },
      { id: 'employee', name: 'Nhân viên' }
    ],
    '6613-th': [
      { id: 'manager_II', name: 'Trưởng phòng' },
      { id: 'deputy_manager_II', name: 'Phó Trưởng phòng' },
      { id: 'employee', name: 'Nhân viên' }
    ],
    '6613-gd': [
      { id: 'director_II', name: 'Giám đốc' },
      { id: 'deputy_director_II', name: 'Phó Giám đốc' }
    ],

    //6619
    '6619-kt': [
      { id: 'manager_II', name: 'Trưởng phòng' },
      { id: 'deputy_manager_II', name: 'Phó Trưởng phòng' },
      { id: 'employee', name: 'Nhân viên' }
    ],
    '6619-kh': [
      { id: 'manager_II', name: 'Trưởng phòng' },
      { id: 'deputy_manager_II', name: 'Phó Trưởng phòng' },
      { id: 'employee', name: 'Nhân viên' }
    ],
    '6619-pgd': [
      { id: 'director_TO', name: 'Giám đốc' },
      { id: 'deputy_director_TO', name: 'Phó Giám đốc' },
      { id: 'employee', name: 'Nhân viên' }
    ],
    '6619-th': [
      { id: 'manager_II', name: 'Trưởng phòng' },
      { id: 'deputy_manager_II', name: 'Phó Trưởng phòng' },
      { id: 'employee', name: 'Nhân viên' }
    ],
    '6619-gd': [
      { id: 'director_II', name: 'Giám đốc' },
      { id: 'deputy_director_II', name: 'Phó Giám đốc' }
    ],

    //6620
    '6620-kt': [
      { id: 'manager_II', name: 'Trưởng phòng' },
      { id: 'deputy_manager_II', name: 'Phó Trưởng phòng' },
      { id: 'employee', name: 'Nhân viên' }
    ],
    '6620-kh': [
      { id: 'manager_II', name: 'Trưởng phòng' },
      { id: 'deputy_manager_II', name: 'Phó Trưởng phòng' },
      { id: 'employee', name: 'Nhân viên' }
    ],
    '6620-th': [
      { id: 'manager_II', name: 'Trưởng phòng' },
      { id: 'deputy_manager_II', name: 'Phó Trưởng phòng' },
      { id: 'employee', name: 'Nhân viên' }
    ],
    '6620-gd': [
      { id: 'director_II', name: 'Giám đốc' },
      { id: 'deputy_director_II', name: 'Phó Giám đốc' }
    ],

    //6668
    '6668-kt': [
      { id: 'manager_II', name: 'Trưởng phòng' },
      { id: 'deputy_manager_II', name: 'Phó Trưởng phòng' },
      { id: 'employee', name: 'Nhân viên' }
    ],
    '6668-kh': [
      { id: 'manager_II', name: 'Trưởng phòng' },
      { id: 'deputy_manager_II', name: 'Phó Trưởng phòng' },
      { id: 'employee', name: 'Nhân viên' }
    ],
    '6668-th': [
      { id: 'manager_II', name: 'Trưởng phòng' },
      { id: 'deputy_manager_II', name: 'Phó Trưởng phòng' },
      { id: 'employee', name: 'Nhân viên' }
    ],
    '6668-gd': [
      { id: 'director_II', name: 'Giám đốc' },
      { id: 'deputy_director_II', name: 'Phó Giám đốc' }
    ]
  }
};

export function findNameById(list, id) {
  return (list || []).find(x => x.id === id)?.name || '';
}
