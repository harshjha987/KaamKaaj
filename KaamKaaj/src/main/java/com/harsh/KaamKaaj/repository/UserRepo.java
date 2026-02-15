package com.harsh.KaamKaaj.repository;

import com.harsh.KaamKaaj.model.Users;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;


@Repository
public interface UserRepo extends JpaRepository<Users,Integer> {

    Users findByUsername(String username);
}
