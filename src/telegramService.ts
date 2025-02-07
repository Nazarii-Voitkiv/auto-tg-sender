import axios from "axios";
import supabase from "./supabase";

const BASE_URL = `https://api.telegram.org`;

interface SendStats {
  groupId: string;
  messageId: number;
  sentAt: Date;
  success: boolean;
}

export const sendMessages = async () => {
  const { data: messages } = await supabase.from("messages").select();
  const { data: groups } = await supabase.from("groups").select();

  if (!messages || !groups || messages.length === 0 || groups.length === 0) {
    console.log("❌ Немає повідомлень або груп для відправки.");
    return;
  }

  const stats: SendStats[] = [];

  for (const group of groups) {
    try {
      const randomMessage = messages[Math.floor(Math.random() * messages.length)];
      
      // Перевірка на дублікати
      const { data: recentSends } = await supabase
        .from("send_logs")
        .select()
        .eq("groupId", group.groupId)
        .eq("messageId", randomMessage.id)
        .gte("sentAt", new Date(Date.now() - 24 * 60 * 60 * 1000));

      if (recentSends && recentSends.length > 0) {
        console.log(`⚠️ Пропуск дубліката для групи ${group.groupId}`);
        continue;
      }

      const response = await axios.post(`${BASE_URL}/bot${process.env.BOT_TOKEN}/sendMessage`, {
        chat_id: group.groupId,
        text: randomMessage.text,
      });

      // Логування відправки
      await supabase.from("send_logs").insert([{
        groupId: group.groupId,
        messageId: randomMessage.id,
        sentAt: new Date(),
        success: true
      }]);

      stats.push({
        groupId: group.groupId,
        messageId: randomMessage.id,
        sentAt: new Date(),
        success: true
      });

      console.log(`✅ Повідомлення відправлено в групу ${group.groupId}`);
    } catch (error) {
      console.error(`❌ Помилка надсилання в групу ${group.groupId}:`, error);
      
      stats.push({
        groupId: group.groupId,
        messageId: -1,
        sentAt: new Date(),
        success: false
      });
    }
  }

  return stats;
};