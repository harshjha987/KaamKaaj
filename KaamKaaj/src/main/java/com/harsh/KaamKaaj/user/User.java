package com.harsh.KaamKaaj.user;


import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@ToString(exclude = "passwordHash")
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(name = "username" , nullable = false,unique = true,length = 15)
    private String username;

    @Column(name = "email" , nullable = false,unique = true,length = 254)
    private String email;

    @Column(name = "password_hash" , nullable = false, length = 100)
    private String passwordHash;

    @Column(name = "email_verified" , nullable = false)
    private boolean emailVerified = false;



}
