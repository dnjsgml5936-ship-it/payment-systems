import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  Image,
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  ActivityIndicator,
  Button,
  TextInput,
  Chip,
  Divider,
} from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { fetchSettlementDetail, approveSettlement } from '../../services/api';
import { SettlementRequest } from '../../types';

const ApprovalDetailScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const queryClient = useQueryClient();
  const { settlementId } = route.params as { settlementId: string };
  
  const [comment, setComment] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const { data: settlement, isLoading } = useQuery(
    ['settlement', settlementId],
    () => fetchSettlementDetail(settlementId)
  );

  const approveMutation = useMutation(
    (data: { action: 'approve' | 'reject'; comment?: string }) =>
      approveSettlement(settlementId, data),
    {
      onSuccess: (data) => {
        Alert.alert(
          '성공',
          data.message,
          [
            {
              text: '확인',
              onPress: () => {
                queryClient.invalidateQueries('approvals');
                navigation.goBack();
              },
            },
          ]
        );
      },
      onError: (error: any) => {
        Alert.alert('오류', error.message || '처리 중 오류가 발생했습니다.');
      },
    }
  );

  const handleApprove = () => {
    Alert.alert(
      '승인 확인',
      '이 정산결의서를 승인하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '승인',
          onPress: () => {
            setIsProcessing(true);
            approveMutation.mutate(
              { action: 'approve', comment },
              {
                onSettled: () => setIsProcessing(false),
              }
            );
          },
        },
      ]
    );
  };

  const handleReject = () => {
    Alert.alert(
      '거부 확인',
      '이 정산결의서를 거부하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '거부',
          style: 'destructive',
          onPress: () => {
            setIsProcessing(true);
            approveMutation.mutate(
              { action: 'reject', comment },
              {
                onSettled: () => setIsProcessing(false),
              }
            );
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!settlement) {
    return (
      <View style={styles.errorContainer}>
        <Paragraph>정산결의서를 찾을 수 없습니다.</Paragraph>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.header}>
            <Title style={styles.title}>{settlement.title}</Title>
            <Chip
              mode="outlined"
              style={[
                styles.statusChip,
                { backgroundColor: getStatusColor(settlement.status) },
              ]}
            >
              {getStatusText(settlement.status)}
            </Chip>
          </View>
          
          <View style={styles.meta}>
            <Paragraph style={styles.author}>
              작성자: {settlement.author.name}
            </Paragraph>
            <Paragraph style={styles.date}>
              {new Date(settlement.createdAt).toLocaleDateString()}
            </Paragraph>
          </View>
          
          <View style={styles.amountContainer}>
            <Title style={styles.amount}>
              ₩{Number(settlement.totalAmount).toLocaleString()}
            </Title>
          </View>
          
          {settlement.notes && (
            <View style={styles.notesContainer}>
              <Paragraph style={styles.notesLabel}>비고:</Paragraph>
              <Paragraph style={styles.notes}>{settlement.notes}</Paragraph>
            </View>
          )}
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.sectionTitle}>정산 내역</Title>
          {settlement.items.map((item, index) => (
            <View key={item.id} style={styles.itemContainer}>
              <View style={styles.itemHeader}>
                <Paragraph style={styles.itemDescription}>
                  {item.description}
                </Paragraph>
                <Paragraph style={styles.itemAmount}>
                  ₩{Number(item.amount).toLocaleString()}
                </Paragraph>
              </View>
              {item.remarks && (
                <Paragraph style={styles.itemRemarks}>
                  {item.remarks}
                </Paragraph>
              )}
              {index < settlement.items.length - 1 && <Divider style={styles.divider} />}
            </View>
          ))}
        </Card.Content>
      </Card>

      {settlement.status === 'PENDING' && (
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.sectionTitle}>승인 처리</Title>
            
            <TextInput
              label="코멘트 (선택사항)"
              value={comment}
              onChangeText={setComment}
              multiline
              numberOfLines={3}
              style={styles.commentInput}
              mode="outlined"
            />
            
            <View style={styles.buttonContainer}>
              <Button
                mode="contained"
                onPress={handleApprove}
                loading={isProcessing}
                disabled={isProcessing}
                style={[styles.button, styles.approveButton]}
                contentStyle={styles.buttonContent}
              >
                승인
              </Button>
              
              <Button
                mode="outlined"
                onPress={handleReject}
                loading={isProcessing}
                disabled={isProcessing}
                style={[styles.button, styles.rejectButton]}
                contentStyle={styles.buttonContent}
                buttonColor="#fee2e2"
                textColor="#dc2626"
              >
                거부
              </Button>
            </View>
          </Card.Content>
        </Card>
      )}

      {settlement.approvals && settlement.approvals.length > 0 && (
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.sectionTitle}>승인 내역</Title>
            {settlement.approvals.map((approval) => (
              <View key={approval.id} style={styles.approvalContainer}>
                <View style={styles.approvalHeader}>
                  <Paragraph style={styles.approverName}>
                    {approval.approver.name}
                  </Paragraph>
                  <Chip
                    mode="outlined"
                    compact
                    style={[
                      styles.approvalChip,
                      {
                        backgroundColor: approval.action === 'APPROVED' 
                          ? '#dcfce7' 
                          : '#fee2e2'
                      },
                    ]}
                  >
                    {approval.action === 'APPROVED' ? '승인' : '거부'}
                  </Chip>
                </View>
                
                {approval.comment && (
                  <Paragraph style={styles.approvalComment}>
                    {approval.comment}
                  </Paragraph>
                )}
                
                {approval.stampImage && (
                  <View style={styles.stampContainer}>
                    <Image
                      source={{ uri: approval.stampImage }}
                      style={styles.stampImage}
                      resizeMode="contain"
                    />
                  </View>
                )}
                
                <Paragraph style={styles.approvalDate}>
                  {new Date(approval.createdAt).toLocaleString()}
                </Paragraph>
              </View>
            ))}
          </Card.Content>
        </Card>
      )}
    </ScrollView>
  );
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'PENDING':
      return '#fef3c7';
    case 'APPROVED':
      return '#dcfce7';
    case 'REJECTED':
      return '#fee2e2';
    case 'PAID':
      return '#dbeafe';
    default:
      return '#f1f5f9';
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case 'PENDING':
      return '승인대기';
    case 'APPROVED':
      return '승인완료';
    case 'REJECTED':
      return '반려';
    case 'PAID':
      return '송금완료';
    default:
      return status;
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    margin: 16,
    marginBottom: 8,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  title: {
    flex: 1,
    fontSize: 18,
    marginRight: 8,
  },
  statusChip: {
    height: 28,
  },
  meta: {
    marginBottom: 12,
  },
  author: {
    color: '#64748b',
    marginBottom: 4,
  },
  date: {
    color: '#64748b',
    fontSize: 12,
  },
  amountContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  amount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3b82f6',
  },
  notesContainer: {
    marginTop: 8,
  },
  notesLabel: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  notes: {
    color: '#64748b',
  },
  sectionTitle: {
    fontSize: 16,
    marginBottom: 12,
  },
  itemContainer: {
    marginBottom: 8,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  itemDescription: {
    flex: 1,
    fontSize: 14,
  },
  itemAmount: {
    fontWeight: 'bold',
    color: '#3b82f6',
  },
  itemRemarks: {
    color: '#64748b',
    fontSize: 12,
    fontStyle: 'italic',
  },
  divider: {
    marginTop: 8,
  },
  commentInput: {
    marginBottom: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  button: {
    flex: 1,
  },
  approveButton: {
    backgroundColor: '#10b981',
  },
  rejectButton: {
    borderColor: '#dc2626',
  },
  buttonContent: {
    paddingVertical: 8,
  },
  approvalContainer: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
  },
  approvalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  approverName: {
    fontWeight: 'bold',
  },
  approvalChip: {
    height: 24,
  },
  approvalComment: {
    color: '#64748b',
    marginBottom: 8,
    fontStyle: 'italic',
  },
  stampContainer: {
    alignItems: 'center',
    marginVertical: 8,
  },
  stampImage: {
    width: 80,
    height: 80,
  },
  approvalDate: {
    color: '#64748b',
    fontSize: 12,
  },
});

export default ApprovalDetailScreen;
