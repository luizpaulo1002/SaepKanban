import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.*;

class LivroDAO {
    
    public boolean inserir(Livro livro) {
        String sql = """
            INSERT INTO livros (titulo, autor, isbn, ano_publicacao, categoria, 
                               quantidade_total, quantidade_disponivel)
            VALUES (?, ?, ?, ?, ?, ?, ?) //
        """;
        
        try (Connection conn = DatabaseManager.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            
            pstmt.setString(1, livro.getTitulo());
            pstmt.setString(2, livro.getAutor());
            pstmt.setString(3, livro.getIsbn());
            pstmt.setInt(4, livro.getAnoPublicacao());
            pstmt.setString(5, livro.getCategoria());
            pstmt.setInt(6, livro.getQuantidadeTotal());
            pstmt.setInt(7, livro.getQuantidadeDisponivel());
            
            return pstmt.executeUpdate() > 0;
        } catch (SQLException e) {
            System.err.println("Erro ao inserir livro: " + e.getMessage());
            return false;
        }
    }
    
    public List<Livro> listarTodos() {
        List<Livro> livros = new ArrayList<>();
        String sql = "SELECT * FROM livros ORDER BY titulo";
        
        try (Connection conn = DatabaseManager.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {
            
            while (rs.next()) {
                livros.add(resultSetToLivro(rs));
            }
        } catch (SQLException e) {
            System.err.println("Erro ao listar livros: " + e.getMessage());
        }
        
        return livros;
    }
    
    public Livro buscarPorId(int id) {
        String sql = "SELECT * FROM livros WHERE id = ?";
        
        try (Connection conn = DatabaseManager.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            
            pstmt.setInt(1, id);
            ResultSet rs = pstmt.executeQuery();
            
            if (rs.next()) {
                return resultSetToLivro(rs);
            }
        } catch (SQLException e) {
            System.err.println("Erro ao buscar livro: " + e.getMessage());
        }
        
        return null;
    }
    
    public List<Livro> buscarPorTitulo(String titulo) {
        List<Livro> livros = new ArrayList<>();
        String sql = "SELECT * FROM livros WHERE titulo LIKE ? ORDER BY titulo";
        
        try (Connection conn = DatabaseManager.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            
            pstmt.setString(1, "%" + titulo + "%");
            ResultSet rs = pstmt.executeQuery();
            
            while (rs.next()) {
                livros.add(resultSetToLivro(rs));
            }
        } catch (SQLException e) {
            System.err.println("Erro ao buscar livros: " + e.getMessage());
        }
        
        return livros;
    }
    
    public List<Livro> buscarPorAutor(String autor) {
        List<Livro> livros = new ArrayList<>();
        String sql = "SELECT * FROM livros WHERE autor LIKE ? ORDER BY titulo";
        
        try (Connection conn = DatabaseManager.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            
            pstmt.setString(1, "%" + autor + "%");
            ResultSet rs = pstmt.executeQuery();
            
            while (rs.next()) {
                livros.add(resultSetToLivro(rs));
            }
        } catch (SQLException e) {
            System.err.println("Erro ao buscar livros por autor: " + e.getMessage());
        }
        
        return livros;
    }
    
    public boolean atualizar(Livro livro) {
        String sql = """
            UPDATE livros SET titulo = ?, autor = ?, isbn = ?, 
                             ano_publicacao = ?, categoria = ?, 
                             quantidade_total = ?, quantidade_disponivel = ?
            WHERE id = ?
        """;
        
        try (Connection conn = DatabaseManager.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            
            pstmt.setString(1, livro.getTitulo());
            pstmt.setString(2, livro.getAutor());
            pstmt.setString(3, livro.getIsbn());
            pstmt.setInt(4, livro.getAnoPublicacao());
            pstmt.setString(5, livro.getCategoria());
            pstmt.setInt(6, livro.getQuantidadeTotal());
            pstmt.setInt(7, livro.getQuantidadeDisponivel());
            pstmt.setInt(8, livro.getId());
            
            return pstmt.executeUpdate() > 0;
        } catch (SQLException e) {
            System.err.println("Erro ao atualizar livro: " + e.getMessage());
            return false;
        }
    }
    
    public boolean deletar(int id) {
        String sql = "DELETE FROM livros WHERE id = ?";
        
        try (Connection conn = DatabaseManager.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            
            pstmt.setInt(1, id);
            return pstmt.executeUpdate() > 0;
        } catch (SQLException e) {
            System.err.println("Erro ao deletar livro: " + e.getMessage());
            return false;
        }
    }
    
    public boolean atualizarQuantidadeDisponivel(int id, int novaQuantidade) {
        String sql = "UPDATE livros SET quantidade_disponivel = ? WHERE id = ?";
        
        try (Connection conn = DatabaseManager.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            
            pstmt.setInt(1, novaQuantidade);
            pstmt.setInt(2, id);
            
            return pstmt.executeUpdate() > 0;
        } catch (SQLException e) {
            System.err.println("Erro ao atualizar quantidade: " + e.getMessage());
            return false;
        }
    }
    
    private Livro resultSetToLivro(ResultSet rs) throws SQLException {
        Livro livro = new Livro();
        livro.setId(rs.getInt("id"));
        livro.setTitulo(rs.getString("titulo"));
        livro.setAutor(rs.getString("autor"));
        livro.setIsbn(rs.getString("isbn"));
        livro.setAnoPublicacao(rs.getInt("ano_publicacao"));
        livro.setCategoria(rs.getString("categoria"));
        livro.setQuantidadeTotal(rs.getInt("quantidade_total"));
        livro.setQuantidadeDisponivel(rs.getInt("quantidade_disponivel"));
        return livro;
    }
}