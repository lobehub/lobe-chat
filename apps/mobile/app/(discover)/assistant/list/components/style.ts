import { createStyles } from '@/theme';

export const useStyles = createStyles((token) => ({
  authorContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 8,
  },
  authorName: {
    color: token.colorTextSecondary,
    fontSize: 14,
  },
  avatar: {
    fontSize: 30,
  },
  avatarContainer: {
    alignItems: 'center',
    borderRadius: 30,
    elevation: 2,
    height: 60,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { height: 2, width: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    width: 60,
  },
  card: {
    backgroundColor: token.colorBgContainer,
    borderColor: token.colorBorder,
    borderRadius: 16,
    borderWidth: token.lineWidth,
    overflow: 'hidden',
  },
  cardContent: {
    padding: 16,
  },
  cardLink: {
    marginBottom: 16,
    width: '100%',
  },
  date: {
    fontSize: 14,
    opacity: 0.8,
  },
  description: {
    color: token.colorTextSecondary,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  headerContainer: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  name: {
    color: token.colorText,
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginLeft: -4,
  },
  titleContainer: {
    flex: 1,
    paddingRight: 12,
  },
}));
