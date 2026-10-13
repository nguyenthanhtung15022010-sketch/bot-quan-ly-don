const { 
    Client, 
    GatewayIntentBits, 
    EmbedBuilder, 
    ActionRowBuilder, 
    ButtonBuilder, 
    ButtonStyle 
} = require('discord.js');
const express = require('express');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// Khởi tạo Express server để giữ bot online 24/7 trên Render
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('Bot Discord is running!');
});

app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});

client.once('ready', () => {
    console.log(`🤖 Bot ${client.user.tag} đã sẵn sàng!`);
});

client.on('interactionCreate', async interaction => {
    // Xử lý khi bấm nút "Xem đơn hàng"
    if (interaction.isButton()) {
        await interaction.deferReply({ flags: 64 });

        const embedDonHang = new EmbedBuilder()
            .setTitle('📦 DANH SÁCH ĐƠN HÀNG')
            .setDescription('Hiện tại chưa có đơn hàng nào mới hoặc các đơn đã được cập nhật.')
            .setColor(0x00FF00);

        await interaction.editReply({ embeds: [embedDonHang] });
        return;
    }

    if (!interaction.isChatInputCommand()) return;

    // Lệnh /tao_bang_don
    if (interaction.commandName === 'tao_bang_don') {
        const embed = new EmbedBuilder()
            .setTitle('📦 QUẢN LÝ ĐƠN HÀNG')
            .setDescription('Nhấn **👀 Xem đơn hàng** để xem chi tiết.')
            .setColor(0x00FF00);

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('btn_xem_don')
                .setLabel('👀 Xem đơn hàng')
                .setStyle(ButtonStyle.Success)
        );

        await interaction.reply({ embeds: [embed], components: [row] });
    }
});
// Mảng lưu danh sách đơn hàng
let danhSachDonHang = [
    {
        id: '#49',
        ten: '2 Cob Jouan',
        gia: '400m',
        nguoiNhan: '<@neighbor>',
        ghiChu: 'Có Base Sẵn ib Tung'
    },
    {
        id: '#48',
        ten: '2 Etz V2.2 + 1K5 Smoker',
        gia: '550m',
        nguoiNhan: '<@Dương>',
        ghiChu: 'Etz Nối Liền... Smoker Yêu Thao Túng... Tự Đào Base'
    }
];

// Trong client.on('interactionCreate', async interaction => { ...

    // Xử lý lệnh /xoa_don
    if (interaction.commandName === 'xoa_don') {
        await interaction.deferReply({ flags: 64 }); // Tránh timeout 3s

        let maDonInput = interaction.options.getString('ma_don').trim();

        // Tự động thêm dấu # nếu người dùng chỉ nhập số (ví dụ gõ "48" -> "#48")
        if (!maDonInput.startsWith('#')) {
            maDonInput = `#${maDonInput}`;
        }

        // Tìm vị trí đơn hàng trong mảng
        const index = danhSachDonHang.findIndex(don => don.id.toLowerCase() === maDonInput.toLowerCase());

        if (index !== -1) {
            const donDaXoa = danhSachDonHang.splice(index, 1)[0];
            await interaction.editReply({ content: `✅ Đã xóa thành công đơn **${donDaXoa.id} — ${donDaXoa.ten}**!` });
        } else {
            await interaction.editReply({ content: `❌ Không thấy đơn **${maDonInput}** trong hệ thống!` });
        }
        return;
    }
client.login(process.env.DISCORD_TOKEN);