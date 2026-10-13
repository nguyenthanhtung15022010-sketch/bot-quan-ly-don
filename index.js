const { 
    Client, 
    GatewayIntentBits, 
    REST, 
    Routes, 
    SlashCommandBuilder, 
    EmbedBuilder, 
    ActionRowBuilder, 
    ButtonBuilder, 
    ButtonStyle 
} = require('discord.js');
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('Bot Discord is running!');
});

app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});

const TOKEN = process.env.DISCORD_TOKEN;
const CLIENT_ID = '1559102669291786280';

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

let orders = [
    { id: 51, ten_don: '3 Cob Jouan', gia: '610m', trang_thai: 'Đang chờ', nguoi_nhan: null, ghi_chu: 'Tu Dao Base lb Tung' },
    { id: 50, ten_don: 'cob Jouan', gia: '200m', trang_thai: 'Đã có người nhận', nguoi_nhan: '<@Meomeo>', ghi_chu: 'Co base san ib Tung' },
    { id: 49, ten_don: '2 Cob Jouan', gia: '400m', trang_thai: 'Đã có người nhận', nguoi_nhan: '<@neighbor>', ghi_chu: 'Có Base Sẵn ib Tung' },
    { id: 48, ten_don: '2 Etz V2.2 + 1K5 Smoker', gia: '550m', trang_thai: 'Đã có người nhận', nguoi_nhan: '<@Dương>', ghi_chu: 'Etz Nối Liền... Smoker Yêu Thao Túng... Tự Đào Base' }
];

const commands = [
    new SlashCommandBuilder().setName('tao_bang_don').setDescription('Tạo bảng có nút Xem đơn hàng'),
    new SlashCommandBuilder().setName('them_don').setDescription('Thêm một đơn hàng')
        .addStringOption(opt => opt.setName('ten').setDescription('Tên đơn hàng').setRequired(true))
        .addStringOption(opt => opt.setName('gia').setDescription('Giá đơn hàng').setRequired(true))
        .addStringOption(opt => opt.setName('ghi_chu').setDescription('Ghi chú').setRequired(false)),
    new SlashCommandBuilder().setName('sua_don').setDescription('Sửa thông tin đơn hàng')
        .addIntegerOption(opt => opt.setName('id').setDescription('ID đơn').setRequired(true))
        .addStringOption(opt => opt.setName('trang_thai').setDescription('Trạng thái').setRequired(false)
            .addChoices({ name: 'Đang chờ', value: 'Đang chờ' }, { name: 'Đã có người nhận', value: 'Đã có người nhận' }))
        .addUserOption(opt => opt.setName('nguoi_nhan').setDescription('Người nhận').setRequired(false))
        .addStringOption(opt => opt.setName('ghi_chu').setDescription('Ghi chú').setRequired(false)),
    new SlashCommandBuilder().setName('xoa_don').setDescription('Xóa đơn hàng')
        .addIntegerOption(opt => opt.setName('id').setDescription('ID đơn').setRequired(true))
].map(cmd => cmd.toJSON());

const rest = new REST({ version: '10' }).setToken(TOKEN);

(async () => {
    try {
        await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });
        console.log('Đã đăng ký lệnh thành công!');
    } catch (error) {
        console.error(error);
    }
})();

function buildOrderEmbed() {
    const embed = new EmbedBuilder().setTitle('📦 DANH SÁCH ĐƠN HÀNG').setColor(0x0099FF);
    [...orders].sort((a, b) => b.id - a.id).forEach(order => {
        const isWaiting = order.trang_thai === 'Đang chờ';
        let val = `💰 **Giá:** ${order.gia}\n${isWaiting ? '🟡' : '🟢'} **${order.trang_thai}**\n`;
        if (order.nguoi_nhan) val += `👤 **Người nhận:** ${order.nguoi_nhan}\n`;
        if (order.ghi_chu) val += `📝 ${order.ghi_chu}`;
        embed.addFields({ name: `#${order.id} — ${order.ten_don}`, value: val });
    });
    return embed;
}

client.once('ready', () => console.log(`🤖 Bot ${client.user.tag} đã sẵn sàng!`));

client.on('interactionCreate', async interaction => {
    if (!interaction.isButton()) return;

    // 1. Dòng quan trọng nhất: Báo Discord biết bot đang xử lý để không bị quá 3 giây
    await interaction.deferReply({ flags: 64 }); 

    try {
        // 2. Code tạo embed / danh sách đơn hàng của bạn giữ nguyên ở đây
        // (Ví dụ: const embed = new EmbedBuilder()... )

        // 3. Đổi interaction.reply(...) thành interaction.editReply(...)
        await interaction.editReply({ embeds: [embed] }); 
    } catch (error) {
        console.error(error);
        await interaction.editReply({ content: 'Có lỗi xảy ra khi tải đơn hàng!' });
    }
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === 'tao_bang_don') {
        const embed = new EmbedBuilder().setTitle('📦 QUẢN LÝ ĐƠN HÀNG').setDescription('Nhấn **👀 Xem đơn hàng** để xem chi tiết.').setColor(0x0099FF);
        const row = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('btn_xem_don').setLabel('👀 Xem đơn hàng').setStyle(ButtonStyle.Success));
        await interaction.reply({ embeds: [embed], components: [row] });
    } else if (interaction.commandName === 'them_don') {
        const id = orders.length > 0 ? Math.max(...orders.map(o => o.id)) + 1 : 1;
        orders.push({ id, ten_don: interaction.options.getString('ten'), gia: interaction.options.getString('gia'), trang_thai: 'Đang chờ', nguoi_nhan: null, ghi_chu: interaction.options.getString('ghi_chu') || '' });
        await interaction.reply({ content: `✅ Đã thêm đơn #${id}!`, ephemeral: true });
    } else if (interaction.commandName === 'sua_don') {
        const id = interaction.options.getInteger('id');
        const o = orders.find(x => x.id === id);
        if (!o) return interaction.reply({ content: `❌ Không thấy đơn #${id}!`, ephemeral: true });
        if (interaction.options.getString('trang_thai')) o.trang_thai = interaction.options.getString('trang_thai');
        if (interaction.options.getUser('nguoi_nhan')) o.nguoi_nhan = `<@${interaction.options.getUser('nguoi_nhan').id}>`;
        if (interaction.options.getString('ghi_chu')) o.ghi_chu = interaction.options.getString('ghi_chu');
        await interaction.reply({ content: `✅ Đã sửa đơn #${id}!`, ephemeral: true });
    } else if (interaction.commandName === 'xoa_don') {
        const id = interaction.options.getInteger('id');
        const idx = orders.findIndex(x => x.id === id);
        if (idx === -1) return interaction.reply({ content: `❌ Không thấy đơn #${id}!`, ephemeral: true });
        orders.splice(idx, 1);
        await interaction.reply({ content: `🗑️ Đã xóa đơn #${id}!`, ephemeral: true });
    }
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('Bot is running!');
});

app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});
});
client.login(process.env.DISCORD_TOKEN);