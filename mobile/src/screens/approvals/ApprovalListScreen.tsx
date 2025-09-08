import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  ActivityIndicator,
  Chip,
  FAB,
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from 'react-query';
import { fetchApprovals } from '../services/api';
import { SettlementRequest } from '../../types';

const ApprovalListScreen: React.FC = () => {
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);

  const { data: approvalsData, isLoading, refetch } = useQuery(
    'approvals',
    () => fetchApprovals('pending'),
    {
      refetchInterval: 30000, // 30초마다 새로고침
    }
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const renderSettlementItem = ({ item }: { item: SettlementRequest }) => (
    <Card
      style={styles.card}
      onPress={() => navigation.navigate('ApprovalDetail', { settlementId: item.id })}
    >
      <Card.Content>
        <View style={styles.header}>
          <Title style={styles.title}>{item.title}</Title>
          <Chip
            mode="outlined"
            compact
            style={[
              styles.statusChip,
              { backgroundColor: getStatusColor(item.status) },
            ]}
          >
            {getStatusText(item.status)}
          </Chip>
        </View>
        
        <Paragraph style={styles.author}>
          {item.author.name}
        </Paragraph>
        
        <View style={styles.meta}>
          <Paragraph style={styles.amount}>
            ₩{Number(item.totalAmount).toLocaleString()}
          </Paragraph>
          <Paragraph style={styles.date}>
            {new Date(item.createdAt).toLocaleDateString()}
          </Paragraph>
        </View>
        
        <Paragraph style={styles.items}>
          {item.items.length}개 항목
        </Paragraph>
      </Card.Content>
    </Card>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={approvalsData?.settlements || []}
        renderItem={renderSettlementItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Paragraph style={styles.emptyText}>
              승인 대기 중인 정산결의서가 없습니다.
            </Paragraph>
          </View>
        }
      />
      
      <FAB
        style={styles.fab}
        icon="refresh"
        onPress={onRefresh}
        label="새로고침"
      />
    </View>
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
  listContainer: {
    padding: 16,
  },
  card: {
    marginBottom: 12,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  title: {
    flex: 1,
    fontSize: 16,
    marginRight: 8,
  },
  statusChip: {
    height: 24,
  },
  author: {
    color: '#64748b',
    marginBottom: 8,
  },
  meta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  amount: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#3b82f6',
  },
  date: {
    color: '#64748b',
    fontSize: 12,
  },
  items: {
    color: '#64748b',
    fontSize: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    textAlign: 'center',
    color: '#64748b',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});

export default ApprovalListScreen;
