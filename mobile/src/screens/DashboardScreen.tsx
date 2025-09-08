import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Button,
  ActivityIndicator,
  Chip,
} from 'react-native-paper';
import { useAuth } from '../contexts/AuthContext';
import { useQuery } from 'react-query';
import { fetchDashboardData } from '../services/api';

const DashboardScreen: React.FC = () => {
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  const { data: dashboardData, isLoading, refetch } = useQuery(
    'dashboard',
    fetchDashboardData,
    {
      enabled: !!user,
    }
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.content}>
        <Card style={styles.welcomeCard}>
          <Card.Content>
            <Title>안녕하세요, {user?.name}님!</Title>
            <Paragraph>오늘도 좋은 하루 되세요.</Paragraph>
          </Card.Content>
        </Card>

        <View style={styles.statsContainer}>
          <Card style={styles.statCard}>
            <Card.Content>
              <Title style={styles.statNumber}>
                {dashboardData?.stats.pendingApprovals || 0}
              </Title>
              <Paragraph>승인 대기</Paragraph>
            </Card.Content>
          </Card>

          <Card style={styles.statCard}>
            <Card.Content>
              <Title style={styles.statNumber}>
                ₩{(dashboardData?.stats.monthlyTotal || 0).toLocaleString()}
              </Title>
              <Paragraph>이번 달 총액</Paragraph>
            </Card.Content>
          </Card>
        </View>

        {dashboardData?.recentSettlements && dashboardData.recentSettlements.length > 0 && (
          <Card style={styles.recentCard}>
            <Card.Content>
              <Title>최근 정산결의서</Title>
              {dashboardData.recentSettlements.slice(0, 3).map((settlement) => (
                <View key={settlement.id} style={styles.settlementItem}>
                  <View style={styles.settlementInfo}>
                    <Paragraph style={styles.settlementTitle}>
                      {settlement.title}
                    </Paragraph>
                    <Paragraph style={styles.settlementAuthor}>
                      {settlement.author.name}
                    </Paragraph>
                  </View>
                  <View style={styles.settlementMeta}>
                    <Paragraph style={styles.settlementAmount}>
                      ₩{Number(settlement.totalAmount).toLocaleString()}
                    </Paragraph>
                    <Chip
                      mode="outlined"
                      compact
                      style={[
                        styles.statusChip,
                        {
                          backgroundColor: getStatusColor(settlement.status),
                        },
                      ]}
                    >
                      {getStatusText(settlement.status)}
                    </Chip>
                  </View>
                </View>
              ))}
            </Card.Content>
          </Card>
        )}
      </View>
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
  content: {
    padding: 16,
  },
  welcomeCard: {
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    marginHorizontal: 4,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  recentCard: {
    marginBottom: 16,
  },
  settlementItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  settlementInfo: {
    flex: 1,
  },
  settlementTitle: {
    fontWeight: '500',
  },
  settlementAuthor: {
    fontSize: 12,
    color: '#64748b',
  },
  settlementMeta: {
    alignItems: 'flex-end',
  },
  settlementAmount: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statusChip: {
    height: 24,
  },
});

export default DashboardScreen;
