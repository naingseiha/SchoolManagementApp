# 🎓 School Management System (ប្រព័ន្ធគ្រប់គ្រងសាលារៀន)

A professional Next.js application for managing students, teachers, classes, grades, and reports in Khmer educational institutions.

## ✨ Features

- 👥 Student Management (គ្រប់គ្រងសិស្ស)
- 👨‍🏫 Teacher Management (គ្រប់គ្រងគ្រូបង្រៀន)
- 🏫 Class Management (គ្រប់គ្រងថ្នាក់រៀន)
- 📚 Subject Management (គ្រប់គ្រងមុខវិជ្ជា)
- 📊 Grade Entry & Tracking (បញ្ចូលពិន្ទុ)
- 📈 Reports & Statistics (របាយការណ៍)
- 🏆 Honor Certificates (សារណីយកិត្តិយស)
- 🔐 Role-based Access Control
- 💾 Local Storage Data Persistence
- 🖨️ Print-ready Reports

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/naingseiha/SchoolManagementApp.git

# Navigate to project directory
cd SchoolManagementApp

# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

### Default Credentials

- **Admin:** admin / admin123
- **Class Teacher:** teacher1 / teacher123
- **Teacher:** teacher2 / teacher123
- **Student:** student1 / student123

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication routes
│   └── (dashboard)/       # Protected dashboard routes
├── components/            # Reusable UI components
│   ├── auth/             # Auth-related components
│   ├── dashboard/        # Dashboard components
│   ├── forms/            # Form components
│   ├── layout/           # Layout components
│   ├── reports/          # Report components
│   └── ui/               # Generic UI components
├── context/              # React Context providers
├── lib/                  # Utility libraries
└── types/                # TypeScript definitions
```

## 🛠️ Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **State Management:** React Context
- **Data Storage:** LocalStorage

## 📖 Documentation

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed architecture documentation.

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Author

**Naing Seiha**
- GitHub: [@naingseiha](https://github.com/naingseiha)
