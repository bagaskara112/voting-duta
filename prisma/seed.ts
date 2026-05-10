import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma";
import bcrypt from "bcryptjs";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

const pool = new Pool({ connectionString: process.env["DIRECT_URL"] });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding database...");

  // ==========================================
  // 1. Buat Admin Account
  // ==========================================
  const hashedPassword = await bcrypt.hash("admin123", 12);

  const admin = await prisma.admin.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      username: "admin",
      password: hashedPassword,
      name: "Administrator",
    },
  });
  console.log("✅ Admin created:", admin.username);

  // ==========================================
  // 2. Buat 16 Kandidat Dummy
  // ==========================================
  const candidates = [
    {
      name: "Ahmad Rizky Pratama",
      photo: "/images/candidates/candidate-1.jpg",
      faculty: "Fakultas Teknik",
      major: "Teknik Informatika",
      vision:
        "Mewujudkan universitas yang inovatif dan berdaya saing global melalui penguatan teknologi dan kreativitas mahasiswa.",
      mission:
        "1. Membangun ekosistem inovasi digital di lingkungan kampus\n2. Meningkatkan kolaborasi antar fakultas dalam bidang teknologi\n3. Mendorong partisipasi mahasiswa dalam kompetisi nasional dan internasional",
      programWork:
        "- Launching platform digital kampus terintegrasi\n- Workshop teknologi bulanan gratis untuk semua mahasiswa\n- Program mentoring startup mahasiswa\n- Hackathon tahunan antar universitas",
      order: 1,
    },
    {
      name: "Siti Nurhaliza Putri",
      photo: "/images/candidates/candidate-2.jpg",
      faculty: "Fakultas Ekonomi dan Bisnis",
      major: "Manajemen",
      vision:
        "Membangun generasi mahasiswa yang berkarakter, berwawasan luas, dan siap menghadapi tantangan dunia kerja.",
      mission:
        "1. Memperkuat soft skill dan leadership mahasiswa\n2. Menjalin kemitraan strategis dengan dunia industri\n3. Meningkatkan kesejahteraan dan fasilitas kampus",
      programWork:
        "- Career fair dan job expo semester setiap semester\n- Program sertifikasi profesional bersubsidi\n- Forum diskusi rutin dengan alumni sukses\n- Peningkatan fasilitas ruang belajar dan coworking space",
      order: 2,
    },
    {
      name: "Muhammad Farhan Hakim",
      photo: "/images/candidates/candidate-3.jpg",
      faculty: "Fakultas Hukum",
      major: "Ilmu Hukum",
      vision:
        "Menciptakan lingkungan kampus yang adil, transparan, dan demokratis bagi seluruh civitas akademika.",
      mission:
        "1. Menegakkan transparansi dalam organisasi kemahasiswaan\n2. Memberdayakan mahasiswa dalam advokasi hak-hak mahasiswa\n3. Meningkatkan literasi hukum di kalangan mahasiswa",
      programWork:
        "- Klinik bantuan hukum mahasiswa gratis\n- Pelatihan debat dan public speaking\n- Audit transparansi keuangan organisasi kampus\n- Kampanye anti-bullying dan anti-diskriminasi",
      order: 3,
    },
    {
      name: "Dina Amelia Sari",
      photo: "/images/candidates/candidate-4.jpg",
      faculty: "Fakultas Kedokteran",
      major: "Pendidikan Dokter",
      vision:
        "Membangun kampus sehat yang peduli terhadap kesehatan fisik dan mental seluruh mahasiswa.",
      mission:
        "1. Meningkatkan layanan kesehatan kampus\n2. Mengembangkan program kesehatan mental mahasiswa\n3. Mendorong gaya hidup sehat di lingkungan kampus",
      programWork:
        "- Klinik kesehatan mental gratis untuk mahasiswa\n- Program olahraga bersama mingguan\n- Kampanye kesehatan dan donor darah rutin\n- Seminar kesehatan dengan dokter profesional",
      order: 4,
    },
    {
      name: "Budi Santoso",
      photo: "/images/candidates/candidate-5.jpg",
      faculty: "Fakultas Ilmu Sosial dan Politik",
      major: "Ilmu Komunikasi",
      vision:
        "Menjadikan universitas sebagai pusat kreativitas dan inovasi media yang mampu menginspirasi masyarakat.",
      mission:
        "1. Mengembangkan media kampus yang profesional dan independen\n2. Meningkatkan literasi media digital mahasiswa\n3. Membangun jaringan kreatif antar mahasiswa",
      programWork:
        "- Revitalisasi media kampus (TV, radio, majalah digital)\n- Workshop content creation dan digital marketing\n- Festival seni dan budaya tahunan\n- Kolaborasi dengan media nasional untuk magang",
      order: 5,
    },
    {
      name: "Ratna Dewi Kartika",
      photo: "/images/candidates/candidate-6.jpg",
      faculty: "Fakultas Matematika dan IPA",
      major: "Biologi",
      vision:
        "Membangun kesadaran lingkungan dan keberlanjutan melalui peran aktif mahasiswa dalam pelestarian alam.",
      mission:
        "1. Mengembangkan program kampus hijau dan ramah lingkungan\n2. Mendorong riset mahasiswa di bidang lingkungan\n3. Menjalin kerja sama dengan LSM lingkungan",
      programWork:
        "- Program kampus zero waste\n- Taman edukasi biodiversitas kampus\n- Penanaman 1000 pohon di area kampus\n- Kompetisi riset lingkungan mahasiswa",
      order: 6,
    },
    {
      name: "Irfan Maulana Putra",
      photo: "/images/candidates/candidate-7.jpg",
      faculty: "Fakultas Teknik",
      major: "Teknik Sipil",
      vision:
        "Mewujudkan infrastruktur kampus yang modern, aksesibel, dan ramah bagi seluruh mahasiswa.",
      mission:
        "1. Meningkatkan kualitas fasilitas kampus\n2. Membangun akses yang inklusif untuk mahasiswa disabilitas\n3. Mengoptimalkan ruang publik kampus",
      programWork:
        "- Renovasi fasilitas kampus yang rusak\n- Pembangunan jalur khusus disabilitas\n- Penambahan area parkir dan charging station\n- Smart campus initiative dengan IoT",
      order: 7,
    },
    {
      name: "Anisa Rahma Wulandari",
      photo: "/images/candidates/candidate-8.jpg",
      faculty: "Fakultas Psikologi",
      major: "Psikologi",
      vision:
        "Menciptakan lingkungan kampus yang inklusif, suportif, dan mendukung kesejahteraan psikologis mahasiswa.",
      mission:
        "1. Memperkuat layanan konseling kampus\n2. Membangun komunitas peer support\n3. Menghapus stigma terhadap masalah kesehatan mental",
      programWork:
        "- Peer counseling center di setiap fakultas\n- Workshop manajemen stres dan kecemasan\n- Kampanye mental health awareness\n- Program buddy system untuk mahasiswa baru",
      order: 8,
    },
    {
      name: "Rizal Firmansyah",
      photo: "/images/candidates/candidate-9.jpg",
      faculty: "Fakultas Pertanian",
      major: "Agroteknologi",
      vision:
        "Mengembangkan potensi mahasiswa di bidang ketahanan pangan dan pertanian berkelanjutan.",
      mission:
        "1. Membangun laboratorium pertanian modern\n2. Mendorong inovasi agritech di kalangan mahasiswa\n3. Menjalin kerja sama dengan industri pertanian",
      programWork:
        "- Urban farming project di area kampus\n- Kompetisi inovasi agritech mahasiswa\n- Kemitraan dengan petani lokal untuk KKN tematik\n- Bazar produk pertanian mahasiswa",
      order: 9,
    },
    {
      name: "Maya Indah Permata",
      photo: "/images/candidates/candidate-10.jpg",
      faculty: "Fakultas Ilmu Budaya",
      major: "Sastra Inggris",
      vision:
        "Menjadikan universitas sebagai pusat keunggulan budaya dan bahasa yang membawa nama Indonesia ke kancah internasional.",
      mission:
        "1. Mengembangkan program pertukaran budaya internasional\n2. Meningkatkan kemampuan bahasa asing mahasiswa\n3. Melestarikan budaya lokal melalui kegiatan kampus",
      programWork:
        "- Program exchange student yang lebih aksesibel\n- English & language club mingguan\n- Festival budaya nusantara tahunan\n- Penerjemahan karya mahasiswa ke bahasa internasional",
      order: 10,
    },
    {
      name: "Hendra Wijaya Kusuma",
      photo: "/images/candidates/candidate-11.jpg",
      faculty: "Fakultas Ekonomi dan Bisnis",
      major: "Akuntansi",
      vision:
        "Membangun ekosistem kewirausahaan mahasiswa yang kuat dan berkelanjutan.",
      mission:
        "1. Menyediakan inkubator bisnis mahasiswa\n2. Memfasilitasi akses modal usaha untuk mahasiswa\n3. Mengembangkan marketplace produk mahasiswa",
      programWork:
        "- Inkubator bisnis mahasiswa dengan mentor profesional\n- Dana hibah usaha mahasiswa\n- Marketplace online produk UMKM mahasiswa\n- Kelas wirausaha dengan pengusaha sukses",
      order: 11,
    },
    {
      name: "Putri Ayu Lestari",
      photo: "/images/candidates/candidate-12.jpg",
      faculty: "Fakultas Ilmu Pendidikan",
      major: "Pendidikan Guru Sekolah Dasar",
      vision:
        "Meningkatkan kualitas pendidikan dan pengabdian masyarakat melalui peran aktif mahasiswa.",
      mission:
        "1. Memperluas program pengabdian masyarakat mahasiswa\n2. Meningkatkan kualitas pengajaran dan tutorial sebaya\n3. Mendorong inovasi dalam metode pembelajaran",
      programWork:
        "- Volunteer teaching di daerah terpencil\n- Tutor sebaya gratis untuk mata kuliah sulit\n- Workshop pedagogik untuk asisten dosen\n- Festival pendidikan dan inovasi pembelajaran",
      order: 12,
    },
    {
      name: "Dimas Arya Nugraha",
      photo: "/images/candidates/candidate-13.jpg",
      faculty: "Fakultas Teknik",
      major: "Teknik Elektro",
      vision:
        "Memajukan universitas melalui penguatan riset dan pengembangan teknologi tepat guna.",
      mission:
        "1. Meningkatkan publikasi ilmiah mahasiswa\n2. Membangun laboratorium riset yang lebih lengkap\n3. Mendorong kolaborasi riset dengan industri",
      programWork:
        "- Dana riset mahasiswa dari kerja sama industri\n- Journal club dan writing clinic ilmiah\n- Pameran inovasi dan teknologi tahunan\n- Program magang riset di perusahaan teknologi",
      order: 13,
    },
    {
      name: "Lina Safitri Handayani",
      photo: "/images/candidates/candidate-14.jpg",
      faculty: "Fakultas Farmasi",
      major: "Farmasi",
      vision:
        "Mewujudkan kampus yang peduli terhadap kesehatan masyarakat dan pengembangan obat berbasis riset.",
      mission:
        "1. Mengembangkan apotek kampus yang terjangkau\n2. Meningkatkan riset farmasi mahasiswa\n3. Melakukan edukasi kesehatan ke masyarakat",
      programWork:
        "- Apotek mahasiswa dengan harga terjangkau\n- Riset obat herbal berbasis kearifan lokal\n- Posyandu kampus untuk masyarakat sekitar\n- Seminar farmasi dan kesehatan rutin",
      order: 14,
    },
    {
      name: "Fajar Ramadhan Syahputra",
      photo: "/images/candidates/candidate-15.jpg",
      faculty: "Fakultas Ilmu Komputer",
      major: "Sistem Informasi",
      vision:
        "Membangun sistem informasi kampus yang terintegrasi dan memudahkan seluruh aktivitas akademik.",
      mission:
        "1. Mendigitalisasi seluruh layanan administrasi kampus\n2. Mengembangkan aplikasi mobile untuk mahasiswa\n3. Meningkatkan keamanan data kampus",
      programWork:
        "- Aplikasi mobile kampus all-in-one\n- Portal akademik yang lebih user-friendly\n- Sistem antrian online untuk layanan kampus\n- Cybersecurity awareness campaign",
      order: 15,
    },
    {
      name: "Nabila Azzahra Mumtaz",
      photo: "/images/candidates/candidate-16.jpg",
      faculty: "Fakultas Seni Rupa dan Desain",
      major: "Desain Komunikasi Visual",
      vision:
        "Mengangkat kreativitas dan seni sebagai identitas utama universitas yang membanggakan.",
      mission:
        "1. Memperkuat branding universitas melalui desain\n2. Mengembangkan galeri dan ruang ekspresi seni mahasiswa\n3. Mendorong industri kreatif di lingkungan kampus",
      programWork:
        "- Galeri seni kampus permanen\n- Program residensi seniman untuk mahasiswa\n- Merchandise resmi universitas yang kekinian\n- Festival seni dan desain dengan artis nasional",
      order: 16,
    },
  ];

  for (const candidate of candidates) {
    await prisma.candidate.upsert({
      where: {
        id: `candidate-${candidate.order}`,
      },
      update: candidate,
      create: {
        id: `candidate-${candidate.order}`,
        ...candidate,
      },
    });
  }
  console.log(`✅ ${candidates.length} candidates created`);

  // ==========================================
  // 3. Buat Voting Settings (default: belum dibuka)
  // ==========================================
  const votingSetting = await prisma.votingSetting.upsert({
    where: { id: "main-voting" },
    update: {},
    create: {
      id: "main-voting",
      isOpen: false,
      startTime: new Date("2026-06-01T08:00:00+07:00"),
      endTime: new Date("2026-06-01T20:00:00+07:00"),
      title: "Pemilihan Duta Universitas 2026",
      description:
        "Pemilihan Duta Universitas tahun 2026. Gunakan hak suara Anda dengan bijak. Satu mahasiswa, satu suara.",
    },
  });
  console.log("✅ Voting settings created:", votingSetting.title);

  console.log("\n🎉 Seeding selesai!");
  console.log("📋 Admin login: username=admin, password=admin123");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Seeding error:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
