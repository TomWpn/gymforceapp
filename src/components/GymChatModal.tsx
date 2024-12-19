import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  Modal,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import GymForceText from "./GymForceText";
import { GiftedChat, IMessage } from "react-native-gifted-chat";
import { firestore } from "../services/firebaseConfig";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";

interface GymChatCardProps {
  gymId: string;
  userId: string;
  visible: boolean;
  onClose: () => void;
}

const GymChatModal: React.FC<GymChatCardProps> = ({
  gymId,
  userId,
  visible,
  onClose,
}) => {
  const [messages, setMessages] = useState<IMessage[]>([]);

  useEffect(() => {
    const messagesRef = collection(firestore, `gyms/${gymId}/messages`);
    const q = query(messagesRef, orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedMessages: IMessage[] = snapshot.docs
        .map((doc) => {
          const firebaseData = doc.data();
          if (!firebaseData.createdAt) {
            console.warn(`Message ${doc.id} is missing a createdAt timestamp`);
            return null; // Skip messages without a timestamp
          }
          return {
            _id: doc.id,
            text: firebaseData.text,
            createdAt: firebaseData.createdAt.toDate(),
            user: {
              _id: firebaseData.userId,
              name: firebaseData.userName,
            },
          };
        })
        .filter((message) => message !== null); // Remove invalid messages
      setMessages(fetchedMessages);
    });

    return () => unsubscribe();
  }, [gymId]);

  const onSend = async (newMessages: IMessage[]) => {
    const { _id, createdAt, text, user } = newMessages[0];
    const messagesRef = collection(firestore, `gyms/${gymId}/messages`);

    await addDoc(messagesRef, {
      _id,
      createdAt: serverTimestamp(),
      text,
      userId: user._id,
      userName: user.name,
      status: "unsent",
    });

    setMessages((previousMessages) =>
      GiftedChat.append(previousMessages, newMessages)
    );
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.modalContainer}
      >
        <View style={styles.modalHeader}>
          <GymForceText style={styles.modalTitle}>Chat with Owner</GymForceText>
          <GymForceText style={styles.closeButton} onPress={onClose}>
            Close
          </GymForceText>
        </View>
        <GiftedChat
          messages={messages}
          onSend={(messages) => onSend(messages)}
          user={{
            _id: userId,
            name: "You", // Replace with actual user name if available
          }}
          keyboardShouldPersistTaps="handled"
          renderAvatar={null} // Optional: Hide avatars for a cleaner look
        />
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default GymChatModal;

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#f1600d",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  closeButton: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "bold",
  },
});
